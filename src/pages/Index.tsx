import { Link } from "react-router-dom";

export default function Index() {
  return (
    <>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <Link to={"/page2"}>Page2</Link>
    </>
  );
}
