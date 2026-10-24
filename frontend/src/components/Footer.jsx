import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div>
          <b>FinSim AI</b>
          <p className="mu">
            Learn finance. Simulate investing. Build your future.
          </p>
        </div>
        <div>
          <b>Product</b>
          <Link to="/invest">Invest</Link>
          <Link to="/learn">Learn</Link>
          <Link to="/save">Save</Link>
          <Link to="/markets">Markets</Link>
          <Link to="/portfolio">Portfolio</Link>
        </div>
        <div>
          <b>Project Supervisor</b>
          <Link to="/about"> Ankit Farkya</Link>
        </div>
        <div>
          <b>Account</b>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </footer>
  );
}
