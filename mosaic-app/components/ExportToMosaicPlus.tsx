import React from "react";
import { uploadBytes, ref } from "firebase/storage";
import { nanoid } from "nanoid";

import { trackEvent } from "@mosaic/mosaic/analytics";
import { Card } from "@mosaic/mosaic/components/Card";
import { MosaicLogo } from "@mosaic/mosaic/components/MosaicLogo";
import { IconButton } from "@mosaic/mosaic/components/IconButton";
import { MIME_TYPES, getFrame } from "@mosaic/common";
import {
  encryptData,
  generateEncryptionKey,
} from "@mosaic/mosaic/data/encryption";
import { serializeAsJSON } from "@mosaic/mosaic/data/json";
import { isInitializedImageElement } from "@mosaic/element";
import { useI18n } from "@mosaic/mosaic/i18n";

import type { FileId, NonDeletedMosaicElement } from "@mosaic/element/types";
import type {
  AppState,
  BinaryFileData,
  BinaryFiles,
} from "@mosaic/mosaic/types";

import { FILE_UPLOAD_MAX_BYTES } from "../app_constants";
import { encodeFilesForUpload } from "../data/FileManager";
import { loadFirebaseStorage, saveFilesToFirebase } from "../data/firebase";

export const exportToMosaicPlus = async (
  elements: readonly NonDeletedMosaicElement[],
  appState: Partial<AppState>,
  files: BinaryFiles,
  name: string,
) => {
  const storage = await loadFirebaseStorage();

  const id = `${nanoid(12)}`;

  const encryptionKey = (await generateEncryptionKey())!;
  const encryptedData = await encryptData(
    encryptionKey,
    serializeAsJSON(elements, appState, files, "database"),
  );

  const blob = new Blob(
    [encryptedData.iv, new Uint8Array(encryptedData.encryptedBuffer)],
    {
      type: MIME_TYPES.binary,
    },
  );

  const storageRef = ref(storage, `/migrations/scenes/${id}`);
  await uploadBytes(storageRef, blob, {
    customMetadata: {
      data: JSON.stringify({ version: 2, name }),
      created: Date.now().toString(),
    },
  });

  const filesMap = new Map<FileId, BinaryFileData>();
  for (const element of elements) {
    if (isInitializedImageElement(element) && files[element.fileId]) {
      filesMap.set(element.fileId, files[element.fileId]);
    }
  }

  if (filesMap.size) {
    const filesToUpload = await encodeFilesForUpload({
      files: filesMap,
      encryptionKey,
      maxBytes: FILE_UPLOAD_MAX_BYTES,
    });

    await saveFilesToFirebase({
      prefix: `/migrations/files/scenes/${id}`,
      files: filesToUpload,
    });
  }

  window.open(
    `${import.meta.env.VITE_APP_PLUS_APP}/import?mosaic=${id},${encryptionKey}`,
  );
};

export const ExportToMosaicPlus: React.FC<{
  elements: readonly NonDeletedMosaicElement[];
  appState: Partial<AppState>;
  files: BinaryFiles;
  name: string;
  onError: (error: Error) => void;
  onSuccess: () => void;
}> = ({ elements, appState, files, name, onError, onSuccess }) => {
  const { t } = useI18n();
  return (
    <Card color="primary">
      <div className="Card-icon">
        <MosaicLogo
          style={{
            [`--color-logo-icon` as any]: "#fff",
            width: "2.8rem",
            height: "2.8rem",
          }}
        />
      </div>
      <h2>Mosaic+</h2>
      <div className="Card-details">
        {t("exportDialog.excalidrawplus_description")}
      </div>
      <IconButton
        className="Card-button"
        type="button"
        title={t("exportDialog.excalidrawplus_button")}
        aria-label={t("exportDialog.excalidrawplus_button")}
        showAriaLabel={true}
        onClick={async () => {
          try {
            trackEvent("export", "eplus", `ui (${getFrame()})`);
            await exportToMosaicPlus(elements, appState, files, name);
            onSuccess();
          } catch (error: any) {
            console.error(error);
            if (error.name !== "AbortError") {
              onError(new Error(t("exportDialog.excalidrawplus_exportError")));
            }
          }
        }}
      />
    </Card>
  );
};
