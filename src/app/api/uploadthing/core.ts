import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
    imageUploader: f({ image: { maxFileSize: "4MB" } })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("✅ Upload complete!");
            console.log("- User/Metadata:", metadata);
            console.log("- File URL:", file.url);
            console.log("- File Size:", file.size, "bytes");
            return { uploadedBy: "user", fileUrl: file.url };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
