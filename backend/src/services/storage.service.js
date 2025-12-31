import ImageKit from "imagekit";

// Lazy initialization - only create ImageKit instance when needed
let imagekit = null;

function getImageKit() {
  if (!imagekit) {
    imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    });
  }
  return imagekit;
}

export async function uploadFile(file, fileName) {
  return getImageKit().upload({
    file,
    fileName
  });
}