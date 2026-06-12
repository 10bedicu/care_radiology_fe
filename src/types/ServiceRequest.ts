import { DicomStudy } from "./Dicom";
import { Encounter } from "./encounter";

export interface RadiologyServiceRequest {
  encounter: Encounter;
  dicom_study: DicomStudy;
}