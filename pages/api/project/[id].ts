
import {projectsData} from "../../../data/projectsData";

export default function handler(req, res) {
  const { id } = req.query;
  console.log("pid==", id);
  res.status(200).json({ project: projectsData[id] });
  //   res.end(`Post: ${pid}`);
}
