import { ArrowLeft } from 'lucide-react'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import "./AddChapterPage.scss"
import { Button } from '../../component/ui/button/button'
const AddChapterPage = () => {
  const navigate = useNavigate()
  const handleRedirection = () => {
    navigate("/dashboard/chaptermanager")
  }
  return (
    <div className='Addchapterpage'> <header className="header">
      <div className="container header-container">
        <Link to="/dashboard" className="back-link">
          <ArrowLeft className="icon" /> Back to Dashboard
        </Link>
        <div className="title">
          <span className="emoji">📖</span>
          <span className="text">Turning Pages</span>
        </div>
      </div>
      <Button onClick={() => handleRedirection()}>Add Chapter</Button>
    </header>
    </div>
  )
}

export default AddChapterPage