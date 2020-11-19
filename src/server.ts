import { port } from "./config";
import httpServer from "./app";

httpServer
  .listen(port, () => {
    console.log(`🚀 Server is taking off from port : ${port}`);
  })
  .on("error", (e: any) => {
    console.log("Ending...", e);
  });
