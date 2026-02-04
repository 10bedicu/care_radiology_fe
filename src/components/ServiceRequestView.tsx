import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { DicomStudy } from "@/types/Dicom";
import { apis } from "@/apis";
import React from "react";
import RadiologyStudyTable from "./RadiologyStudyTable";
import { Card, CardContent } from "./ui/card";
import { Label } from "@radix-ui/react-label";

type SRProps = {
  serviceRequestId: string;
};
export const ServiceRequestView: FC<SRProps> = ({ serviceRequestId }) => {
  const { data: dicomStudies } = useQuery<DicomStudy[]>({
    queryKey: ["dicomimagelist", serviceRequestId],
    queryFn: () =>
      apis.servicerequest.fetchStudies({
        serviceRequestId,
      }),
    enabled: true,
  });
  return (
    <React.Fragment>
      {dicomStudies && dicomStudies.length > 0 && (
        <Card className="mb-4 shadow-none rounded-lg border-gray-200 bg-gray-50">
          <CardContent className="p-4">
            <div className="grid gap-4">
              <div className="flex justify-between items-start">
                <Label className="text-base font-semibold text-gray-950">
                  Radiology Studies
                </Label>
              </div>
              <RadiologyStudyTable studies={dicomStudies}></RadiologyStudyTable>
            </div>
          </CardContent>
        </Card>
      )}
    </React.Fragment>
  );
};

export default ServiceRequestView;
