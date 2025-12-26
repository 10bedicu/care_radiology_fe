import { RefObject, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

export default function DicomViewer({
  studyUid,
  seriesUid,
  instanceUid,
}: {
  studyUid: string;
  seriesUid?: string;
  instanceUid?: string;
}) {
  const dicomViewerRef = useRef<HTMLIFrameElement>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const { t } = useTranslation();

  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient
      .ensureQueryData({ queryKey: ["user-refresh-token"] })
      .then((val) => {
        const token = (val as { access: string; refresh: string }).access;
        const ohifBaseUrl = `${
          (window as any).__CORE_ENV__?.radiologyViewerBaseUrl || ""
        }`;
        if (studyUid && seriesUid && instanceUid) {
          setIframeUrl(
            `${ohifBaseUrl}/viewer?StudyInstanceUIDs=${studyUid}&initialSeriesInstanceUID=${seriesUid}&initialSopInstanceUID=${instanceUid}&token=${token}`
          );
        } else {
          setIframeUrl(
            `${ohifBaseUrl}/viewer?StudyInstanceUIDs=${studyUid}&token=${token}`
          );
        }
      });
  }, [queryClient]);

  const goFullscreen = (ref: RefObject<HTMLIFrameElement>) => {
    if (ref.current) ref.current.requestFullscreen();
  };

  if (!iframeUrl) return <div>Please Wait...</div>;

  return (
    <Card className="shadow-sm border border-gray-200 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-xl font-semibold text-gray-800">
          {t("dicom_viewer")}
        </CardTitle>
        <div className="flex gap-5 justify-end">
          <Button
            variant={"primary"}
            onClick={() => {
              goFullscreen(dicomViewerRef as RefObject<HTMLIFrameElement>);
            }}
          >
            Fullscreen
          </Button>
          <Button
            variant={"outline"}
            color={"red"}
            onClick={() => window.history.back()}
          >
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <iframe
          ref={dicomViewerRef}
          className="rounded-xl border w-full h-[80vh]"
          src={iframeUrl}
        ></iframe>
      </CardContent>
    </Card>
  );
}
