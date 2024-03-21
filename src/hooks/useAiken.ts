import { useState, useEffect } from "react"
import init, { Project } from 'aiken-js-bindings'

let projectInstance: Project

function useAiken() {
    const [project, setProject] = useState<Project>(projectInstance)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!projectInstance && !isLoading) {
            setIsLoading(true)

            init()
                .then(() => {
                    projectInstance = new Project()
                    setProject(projectInstance)
                })
                .catch((e) => {
                    setError(e)
                })
                .finally(() => {
                    setIsLoading(false)
                })
        } else if (projectInstance) {
            setProject(projectInstance)
        }
    }, [])

    return {
        project,
        isLoading,
        error
    }
}

export { useAiken }