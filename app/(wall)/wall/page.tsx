/** Lane: wall. /wall: TV mode for the demo table (fullscreen, auto-rotating). */
import TVWall from "@/components/wall/TVWall";
import { loadWallCourses } from "../_lib/courses";

export const metadata = { title: "SmartPath Scout · Wall" };

export default function WallPage() {
  return <TVWall courses={loadWallCourses()} />;
}
