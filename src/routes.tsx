import DicomUploader from "./components/DicomUploader";
import DicomViewer from "./components/DicomViewer";
import DicomReport from "./components/DicomReport";
import StudyReportPreview from "./components/Study/StudyReportPreview";

const routes = {
  "/facility/:facilityid/patient/:patientid/encounter/:encounterid/radiology/uploader":
    ({
      patientid,
      encounterid,
    }: {
      facilityid: string;
      patientid: string;
      encounterid: string;
    }) => (
      <DicomUploader
        patientId={patientid}
        encounterId={encounterid}
      ></DicomUploader>
    ),
  "/facility/:facilityid/patient/:patientid/encounter/:encounterid/radiology/view/:studyid":
    ({ studyid }: { studyid: string }) => (
      <DicomViewer studyUid={studyid}></DicomViewer>
    ),
  "/facility/:facilityid/patient/:patientid/encounter/:encounterid/radiology/report/:studyid":
    ({ studyid }: { studyid: string }) => (
      <DicomReport studyUid={studyid}></DicomReport>
    ),
  "/facility/:facilityid/patient/:patientid/encounter/:encounterid/radiology/report/:studyid/preview":
    ({ studyid }: { studyid: string }) => (
      <StudyReportPreview studyUid={studyid}></StudyReportPreview>
    ),
  /* "/facility/:facilityid/services_requests/radiology/view/:studyid": (
      { studyid }: { studyid: string }
    ) => (
      <DicomViewer studyUid={studyid}></DicomViewer>
    ), */
};

export default routes;
