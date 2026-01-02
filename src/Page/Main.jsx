import React from "react";
import "./Main.scss";
import Header from "../component/Header/Header";
import HeroSection from "../Sections/HeroSection/HeroSection";
import FeaturesSection from "../Sections/FeaturesSection/FeaturesSection";
import WorkflowSection from "../Sections/WorkflowSection/WorkflowSection";
import TestimonialsSection from "../Sections/TestimonialsSection/TestimonialsSection";
import CTABanner from "../Sections/CTABanner/CTABanner";
import Footer from "../component/Footer/Footer";
import PricingCards from "../Sections/PaymentPage/PricingPage";
const Main = () => {
    return (
        <div className="main-page">
            <Header />
            <main className="main-content">
                <HeroSection />
                <FeaturesSection />
                <WorkflowSection />
                <TestimonialsSection />
                <CTABanner />
                <PricingCards />
            </main>
            <Footer />
        </div>
    );
};
export default Main;