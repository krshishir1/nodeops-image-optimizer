
import { create } from "ipfs-http-client";

const ipfs = create({ url: "http://127.0.0.1:5001" });

export async function addFileToIPFS(fileBuffer) {
    // const ipfs = await initIpfs()
    const { cid } = await ipfs.add(fileBuffer);
    return cid
}

