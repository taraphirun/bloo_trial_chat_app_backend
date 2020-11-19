import { port } from "./config";
import app from "./app";

app
  .listen(port, () => {
    console.log(`🚀 Server is taking off from port : ${port}`);
  })
  .on("error", (e: any) => {
    console.log("Ending...", e);
  });
