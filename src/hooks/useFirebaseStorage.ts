import { firebaseStorage, getDownloadURL, listAll, refStorage } from "../config/firebaseConfig";


export const getAboutPageImage = async (imageNumber: string): Promise<string> => {
    const imageListRef = refStorage(firebaseStorage, "aboutPageImages/");
    try {
        const response = await listAll(imageListRef);
        for (var i = 0; i <= response.items.length - 1; i++) {
            const url = await getDownloadURL(response.items[i]);
            if (url.includes(`aboutPageImage_${imageNumber}`)) {
                return url;
            }
        }
        return "";
    } catch (error) {
        console.error("Error setting avatar:", error);
        return "";
    }
};