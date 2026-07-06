import { RefObject, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useTranslation } from "react-i18next";
import { PLUGIN_SLUG } from "@/constants";
import { PlugConfigMeta } from "@/types/plugin";

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
  const { t } = useTranslation(PLUGIN_SLUG);

  useEffect(() => {
    const token = localStorage.getItem("care_access_token") || "";
    const meta = window.__CARE_PLUGIN_RUNTIME__?.meta[PLUGIN_SLUG] as PlugConfigMeta;
    const ohifBaseUrl = `${meta?.radiologyViewerBaseUrl || ""}`;
    if (studyUid && seriesUid && instanceUid) {
      setIframeUrl(
        `${ohifBaseUrl}/viewer?StudyInstanceUIDs=${studyUid}&initialSeriesInstanceUID=${seriesUid}&initialSopInstanceUID=${instanceUid}&token=${token}`
      );
    } else {
      setIframeUrl(
        `${ohifBaseUrl}/viewer?StudyInstanceUIDs=${studyUid}&token=${token}`
      );
    }
  }, [studyUid, seriesUid, instanceUid]);
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
