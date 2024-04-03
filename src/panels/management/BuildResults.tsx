import { useSelector } from "react-redux"
import { RootState } from "../../app/store"
import { BuildResult } from "../../hooks/useAiken"

function BuildResults() {
    const project = useSelector((state: RootState) => state.project)

    const buildResultView = (buildResult: BuildResult, index: number) => {
        const numWarnings = buildResult?.warnings.length
        const numErrors = buildResult?.errors.length
        const numTests = buildResult?.test_results.length
        const numFailedTests = buildResult?.test_results.filter(test => !test.success).length || 0

        const warningsSegment = !numWarnings || numWarnings <= 0 ? null : (
            <div className="build-results-section warnings">
                <span className='build-result-heading'>Warnings</span>
                {
                    buildResult?.warnings.map((warning, index) => {
                        return (
                            <div key={index} className="build-results-individual-result">
                                <div className="warning-item">
                                    On line {warning.line}, {warning.message}
                                </div>
                                <div></div>
                                <div className="warning-item">
                                    {warning.help}
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        )

        const errorsSegment = !numErrors || numErrors <= 0 ? null : (
            <div className="build-results-section errors">
                <span className='build-result-heading'>Errors</span>
                {
                    buildResult?.errors.map((error, index) => {
                        return (
                            <div key={index} className="build-results-individual-result">
                                <div className="error-item">
                                    On line {error.line}, {error.message}
                                </div>
                                <div className="error-item">
                                    {error.help}
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        )

        const testsSegment = !numTests || numTests <= 0 ? null : (
            <div className="build-results-section tests">
                <span className='build-result-heading tests-heading'>Tests</span>

                <div className='tests-body-container'>
                    {
                        buildResult?.test_results.map((test) => {
                            return (
                                <div key={test.index} className="build-results-individual-result">
                                    <div className="test-item">
                                        {test.success ? "✔️ " : "❌ "}{test.name} (CPU: {test.spent_budget.cpu}, Mem: {test.spent_budget.mem})
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
        
        return (

                <div key={index} className='build-result-container'>
                    <div className="build-result-filename">{project.builtFiles[index].name}</div>
                    <div className="summary">
                        <span className="summary-entry error-summary">Errors <span className="error-number">{`${numErrors || 0}`}</span></span>
                        <span className="summary-entry warning-summary">Warnings <span className="warning-number">{`${numWarnings || 0}`}</span></span>
                        <span className="summary-entry test-summary">
                            Tests <span className="test-number">{`${numTests || 0} `}
                                {
                                    numFailedTests > 0 ? (
                                        <span>
                                            (<span className="error-number">{numFailedTests}</span>)
                                        </span>
                                    ) : null
                                }
                            </span>
                        </span>
                    </div>

                    {testsSegment}
                    {warningsSegment}
                    {errorsSegment}
                </div>


        )
        
    }

    return (
        <div className='management-content-scroll-exclusion-wrapper'>
            <div className="management-content management-section-shadow">
                <div className="management-section-heading">Build Results</div>
                { project.buildResults && project.buildResults?.length > 0 ? <></> : <div className="no-last-build-notice card"> No last build to display. Click "Test" to compile.</div>}
                {
                    project.buildResults?.map((result, index) => {
                        return buildResultView(result, index) 
                    })
                }
            </div>
        </div>
    )
}


export { BuildResults }