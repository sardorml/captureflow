export type WebcamName = "cardigan" | "headband" | "striped";

export function WebcamLoop({
  name,
  className,
}: {
  name: WebcamName;
  className?: string;
}) {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      poster={`/webcam/${name}.jpg`}
      className={className ?? "size-full object-cover"}
    >
      <source src={`/webcam/${name}.webm`} type="video/webm" />
      <source src={`/webcam/${name}.mp4`} type="video/mp4" />
    </video>
  );
}
