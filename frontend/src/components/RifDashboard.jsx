import React from 'react'

const RifDashboard = () => {
  return (
    <div className='RifDashboard'>
        <div className='logoimage'>
            <img src={logo} alt='Rif Logo' />
        </div>
        <div className='leftwrapper'>
            <div className='buttonswrapper'>
                <button className='button'>
                    <img src={createProject} alt='Create Project' />
                    <span>Create Project</span>
                </button>
                <button className='button'>
                    <img src={createProject} alt='Create Project' />
                    <span>Create Project</span>
                </button>
            </div>
            <div className='rightwrapper'>
                <div className='projectsbubble'>
                    <h2>List of your projects</h2>
                    <div className='projectlist'>
                        <div className='projectitem'>
                            <img src={projectImage} alt='Project Image' />
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>


    </div>
  )
}

export default RifDashboard
