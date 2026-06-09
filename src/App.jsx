import Nav from './components/Nav'
import Hero from './components/Hero'
import Episodes from './components/Episodes'
import WhyYes from './components/WhyYes'
import Hosts from './components/Hosts'
import Mission from './components/Mission'
import Building from './components/Building'
import Expect from './components/Expect'
import ApplyForm from './components/ApplyForm'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="paper-grain relative min-h-screen">
      <a href="#apply" className="skip-link">
        Skip to the application form
      </a>

      <span id="top" className="sr-only" aria-hidden />
      <Nav />

      <main className="relative z-10">
        <Hero />
        <Episodes />
        <WhyYes />
        <Hosts />
        <Mission />
        <Building />
        <Expect />
        <ApplyForm />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  )
}
