import { Card } from "antd";
import { PageHeader } from "../PageHeader";

export default function Loading() {
  return (
    <>
      <PageHeader title="Screenshots" />
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} loading />
        ))}
      </div>
    </>
  );
}
