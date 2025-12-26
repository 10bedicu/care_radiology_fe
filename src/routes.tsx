import DicomUploader from "./components/DicomUploader";
import DicomViewer from "./components/DicomViewer";

const routes = {
  "/facility/:facilityid/patient/:patientid/encounter/:encounterid/radiology/uploader": (
    { patientid, encounterid }: { facilityid: string, patientid: string, encounterid: string }
  ) => (
    <DicomUploader patientId={patientid} encounterId={encounterid} ></DicomUploader>
  ),
  "/radiology/view/:studyid": (
    { studyid }: { studyid: string }
  ) => (
    <DicomViewer studyUid={studyid}></DicomViewer>
  ),
  "/facility/:facilityid/services_requests/radiology/view/:studyid": (
    { studyid }: { studyid: string }
  ) => (
    <DicomViewer studyUid={studyid}></DicomViewer>
  ),
};

export default routes;
