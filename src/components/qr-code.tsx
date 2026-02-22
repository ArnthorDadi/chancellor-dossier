interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCode({ value, size = 128, className }: QRCodeProps) {
  const encodedValue = encodeURIComponent(value);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedValue}`;

  return (
    <img
      src={qrCodeUrl}
      alt="QR Code for room link"
      className={className}
      width={size}
      height={size}
    />
  );
}
