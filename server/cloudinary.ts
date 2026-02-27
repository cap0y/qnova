import { v2 as cloudinary } from "cloudinary";

// Cloudinary 설정 초기화
// CLOUDINARY_URL 환경변수가 설정되어 있으면 자동으로 인식됨
// 형식: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
cloudinary.config({
  secure: true,
});

/**
 * Buffer 데이터를 Cloudinary에 업로드하는 함수
 * multer의 memoryStorage에서 받은 파일 버퍼를 직접 업로드
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  options: {
    folder: string;
    resourceType?: "image" | "raw" | "auto";
    publicId?: string;
    format?: string;
  },
): Promise<{ url: string; publicId: string; format: string; bytes: number }> {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder: options.folder,
      resource_type: options.resourceType || "auto",
      use_filename: true,
      unique_filename: true,
    };

    if (options.publicId) {
      uploadOptions.public_id = options.publicId;
    }

    if (options.format) {
      uploadOptions.format = options.format;
    }

    // Buffer를 스트림으로 변환하여 업로드
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error("Cloudinary 업로드 오류:", error);
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
          });
        } else {
          reject(new Error("Cloudinary 업로드 결과가 없습니다."));
        }
      },
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Cloudinary에서 파일 삭제
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "raw" = "image",
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error("Cloudinary 삭제 오류:", error);
  }
}

/**
 * Cloudinary 이미지 URL에 변환 옵션 적용
 * 예: 리사이즈, 크롭, 포맷 변환 등
 */
export function getOptimizedUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  },
): string {
  return cloudinary.url(publicId, {
    secure: true,
    width: options?.width,
    height: options?.height,
    crop: options?.crop || "limit",
    quality: options?.quality || "auto",
    fetch_format: options?.format || "auto",
  });
}

export { cloudinary };

