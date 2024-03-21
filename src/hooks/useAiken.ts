import { useState, useEffect } from "react"
import init, { Project } from 'aiken-js-bindings'

let projectInstance: Project

export type BuildResult = {
    errors: BuildError[],
    success: boolean,
    test_results: TestResult[],
    validators: Validator[],
    warnings: BuildError[]
}

export type FormatResult = {
    success: boolean,
    formatted_code: string | null,
    errors: BuildError[]
}

export type BuildError = {
    code: string,
    message: string | null,
    help: string | null,
    line: number
}

type TestResult = {
    success: boolean,
    spent_budget: {
        mem: number,
        cpu: number,
    },
    logs: string[],
    name: string,
    index: number
}

type Validator = {
    index: number,
    name: string,
    parameter_types: string[],
    program: string,
}

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
                .catch((e: any) => {
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