import React, { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { apis } from "@/apis";
import RadiologyStudyTable from "./RadiologyStudyTable";
import { Card, CardContent } from "./ui/card";
import { Label } from "@radix-ui/react-label";
import { DicomStudy } from "@/types/Dicom";

type SRProps = {
  serviceRequestId: string;
};

export const ServiceRequestView: FC<SRProps> = ({ serviceRequestId }) => {
  const { data: dicomStudies } = useQuery<DicomStudy[]>({
    queryKey: ["dicomimagelist", serviceRequestId],
    queryFn: async () => {
      const raw = await apis.servicerequest.fetch({
        serviceRequestId,
      });
      return raw.map((item: any) => item.dicom_study);
    },
    enabled: !!serviceRequestId,
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
              <RadiologyStudyTable studies={dicomStudies} />
            </div>
          </CardContent>
        </Card>
      )}
    </React.Fragment>
  );
};

export default ServiceRequestView;