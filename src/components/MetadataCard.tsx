// components/MetadataCard.tsx
import { format } from "date-fns"
import { IpfsViewer } from "./IpfsViewer"

interface Props {
  metadata: {
    productId: string
    name: string
    description: string
    image?: string
    certificate?: string
    createdAt: string
  }
}

export default function MetadataCard({ metadata }: Props) {
  const ipfsUrl = (ipfsLink?: string) =>
    ipfsLink?.replace("ipfs://", "https://ipfs.io/ipfs/")

  return (
    <div className="space-y-4">
      <div>
        <strong>Mã SP:</strong> {metadata.productId}
      </div>
      <div>
        <strong>Tên SP:</strong> {metadata.name}
      </div>
      <div>
        <strong>Mô tả:</strong> {metadata.description}
      </div>
      {metadata.image && (
        <div>
          <strong>Hình ảnh:</strong>
          <img
            src={ipfsUrl(metadata.image)}
            alt="Ảnh sản phẩm"
            className="w-full max-w-xs mt-2 border rounded"
          />
        </div>
      )}
      {metadata.certificate && (
        <div>
          <strong>Chứng nhận:</strong>
          <IpfsViewer cid={metadata.certificate.replace("ipfs://", "")} />
        </div>
      )}
      <div>
        <strong>Ngày tạo:</strong>{" "}
        {format(new Date(metadata.createdAt), "dd/MM/yyyy HH:mm")}
      </div>
    </div>
  )
}
