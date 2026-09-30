export const MosaicPlusPromoBanner = ({
  isSignedIn,
}: {
  isSignedIn: boolean;
}) => {
  return (
    <a
      href={
        isSignedIn
          ? import.meta.env.VITE_APP_PLUS_APP
          : `${
              import.meta.env.VITE_APP_PLUS_LP
            }/plus?utm_source=mosaic&utm_medium=app&utm_content=guestBanner`
      }
      target="_blank"
      rel="noopener"
      className="plus-banner"
    >
      Mosaic+
    </a>
  );
};
