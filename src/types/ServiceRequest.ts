import { DicomStudy } from "./Dicom";
import { Encounter } from "./encounter";
import { User } from "./User";

export interface ServiceRequest {
  id: string;
  encounter: Encounter;
  requester: User;

  [key: string]: unknown;
}

export interface RadiologyServiceRequest {
  service_request: ServiceRequest;
  dicom_study: DicomStudy;
}
