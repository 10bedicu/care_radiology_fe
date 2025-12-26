import { queryString, request } from "./request";

// FIXME: Move all the api specific types to a ./types.ts file

export const apis = {
  dicom: {
    fetchStudies: async (query?: {
      facility?: string;
      patient?: string;
      ordering?: string;
    }) => {
      return await request<any>(
        `/api/care_radiology/dicom/studies/${queryString({
          patientId: query?.patient ?? "",
        })}`
      );
    },

    upload: async (payload: FormData): Promise<DicomUploadResponse> => {
      return await request<DicomUploadResponse>(
        "/api/care_radiology/dicom/upload/",
        {
          body: payload,
          method: "POST",
        },
        {
          isFormdata: true,
        }
      );
    },
  },
  servicerequest: {
    fetchStudies: async (query: { serviceRequestId: string }) => {
      return await request<any>(
        `/api/care_radiology/dicom/service-requests${queryString({
          serviceRequestId: query?.serviceRequestId ?? "",
        })}`
      )
    }
  }
};

interface DicomUploadResponse {
  message: string;
  study_uid: string;
}
