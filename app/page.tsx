import Image from "next/image";
import BlockTable from "@/components/Block/BlockTable";;
import LatestTransactions from "@/components/Transactions/LatestTransactions";
export default function Home() {
  return (
    <div className="flex gap-2 w-full">
      <div className="flex-1">
        <BlockTable />
      </div>
      <div className="flex-1">
        <LatestTransactions />
      </div>
    </div>
  );
}
