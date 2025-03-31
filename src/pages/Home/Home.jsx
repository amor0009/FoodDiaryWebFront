import { useRef } from "react";
import Header from "../../components/Home/Header";
import CaloriesForm from "../../components/Home/CaloriesForm";
import "./Home.css";
import MainWindowMessage from "../../components/Home/MainWindowMessage";
import ProblemSolution from "../../components/Home/ProblemsSolutions";
import HowItWorks from "../../components/Home/HowItWorks";

export default function Home() {
  const calculatorRef = useRef(null);

  const scrollToCalculator = () => {
    calculatorRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="container">
      <div className="preview">
        <Header />
        <MainWindowMessage scrollToCalculator={scrollToCalculator} />
      </div>
      <div className="advantages">
        <ProblemSolution />
      </div>
      <div className="works">
        <HowItWorks />
      </div>
      <div className="calculate-nutrients" ref={calculatorRef}>
        <CaloriesForm />
      </div>
    </div>
  );
}