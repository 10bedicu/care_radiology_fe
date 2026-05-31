import { Card } from "../ui/card";

export default function PatientDetails() {
  return (
    <Card className="mb-4 bg-gray-50/30 w-full overflow-visible">
      <div className="flex flex-row gap-6 p-4 text-sm border-b bg-white w-full">
        {/* Patient Name & Demographics */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">PATIENT</span>
          <span className="font-semibold text-gray-900 text-base">Ravi Iyer</span>
          <span className="text-gray-600 text-sm">M, 47 · MRN 884302</span>
        </div>

        {/* Study Date & Time */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">STUDY DATE</span>
          <span className="font-semibold text-gray-900">30 May 2026</span>
          <span className="text-gray-600">10:42 AM</span>
        </div>

        {/* Referring Physician & Department */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
            REFERRING PHYSICIAN
          </span>
          <span className="font-semibold text-gray-900">Dr. Anita Sharma</span>
          <span className="text-gray-600">General Medicine</span>
        </div>

        {/* Accession Number */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
            ACCESSION #
          </span>
          <span className="font-semibold text-gray-900">ACC-2026-005821</span>
        </div>

        {/* Report Status */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">STATUS</span>
          <span className="inline-flex items-center gap-2 mt-1">
            <span className="px-3 py-1 rounded-md bg-yellow-100 text-yellow-800 text-sm font-medium">
              Pending Report
            </span>
          </span>
        </div>
      </div>
    </Card>
  );
}
