import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../app/store"
import { useLucid } from "../../hooks/useLucid"
import React, { useState } from "react"

type ScriptKind = 'aiken' | 'native'
function Contracts() {
    const { isLucidLoading, lucid: lucidOrUndefined} = useLucid()
    const [scriptType, setScriptType] = useState<ScriptKind>('aiken')
    const [scriptName, setScriptName] = useState<string | undefined>(undefined)
    const [paramsFilename, setParamsFilename] = useState<string | undefined>(undefined)

    const buildResults = useSelector((state: RootState) => state.project.buildResults)
    const files = useSelector((state: RootState) => state.files.files)
    const dispatch = useDispatch()

    if (isLucidLoading || !lucidOrUndefined) {
        return (
            <div>{ /* Please wait... */ }</div>
        )
    }

    const lucid = lucidOrUndefined!!

    console.log(scriptName, paramsFilename, dispatch, lucid)
    
    const validators = buildResults?.flatMap(buildResult => {
        return buildResult.validators
    })

    const validatorChoices = validators?.map(validator => validator.name) || []
    const jsonFiles = files.filter(file => file.type === 'json')
    const jsonChoices = jsonFiles.map(file => file.name)


    return (
        <div className='contracts-content'>
            <div> script type ?
                <select 
                    defaultValue={scriptType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        setScriptType(e.target.value as ScriptKind)
                    }}
                >
                    <option value='aiken'>Aiken</option>
                    <option value='native'>Native Script</option>
                </select>
            </div>

            <div>
                which one ?
                {
                    scriptType === 'aiken' ?
                        (
                            <select
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                    setScriptName(e.target.value)
                                }}
                            >
                                { validatorChoices?.map(validatorName => 
                                    <option 
                                        value={validatorName}
                                        key={validatorName}
                                    >{validatorName}
                                    </option>
                                )}
                            </select>
                        ) : (
                            <select>
                                { jsonChoices?.map(fileName => 
                                    <option 
                                        value={fileName}
                                        key={fileName}
                                    >{fileName}
                                    </option>
                                )}
                            </select>
                        )
                }
            </div>

            <div>
                { scriptType === 'aiken' ? <span>params?</span> : null}
                { scriptType === 'aiken' ?
                    (
                        <select
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                setParamsFilename(e.target.value)
                            }}
                        >
                            { jsonChoices?.map(fileName => 
                                <option 
                                    value={fileName}
                                    key={fileName}
                                >{fileName}
                                </option>
                            )}
                        </select>
                    ) : null
                }
            </div>
        </div>
    )
}

export { Contracts }