import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../../app/store"
import React, { useRef, useState } from "react"
import { Constr, Data, Script, applyDoubleCborEncoding, applyParamsToScript } from "lucid-cardano"
import { addContract, clearAddContractError, setAddContractError } from "../../../features/management/managementSlice"
import { useTooltip } from "../../../hooks/useTooltip"
import { useLucid } from "../../../components/LucidProvider"
import { constructObject } from "../../../util/data"

type ScriptKind = 'aiken' | 'native'
function AddContract() {
    const addButtonRef = useRef<HTMLButtonElement>(null);
    const { isLucidLoading, lucid: lucidOrNull } = useLucid()
    const [scriptType, setScriptType] = useState<ScriptKind>('aiken')
    const [scriptName, setScriptName] = useState<string | undefined>(undefined)
    const [paramsFilename, setParamsFilename] = useState<string | undefined>(undefined)

    const buildResults = useSelector((state: RootState) => state.project.buildResults)
    const files = useSelector((state: RootState) => state.files.files)
    const addContractError = useSelector((state: RootState) => state.management.addContractError)
    const dispatch = useDispatch()

    useTooltip(addContractError || '', addButtonRef, { x: -100, y: -50 }, () => {
        dispatch(clearAddContractError())
    })

    if (isLucidLoading || !lucidOrNull) {
        return (
            <div>{ /* Please wait... */}</div>
        )
    }

    const lucid = lucidOrNull!!

    const validators = buildResults?.flatMap(buildResult => {
        return buildResult.validators
    })

    const validatorChoices = validators?.map(validator => validator.name) || []
    const jsonFiles = files.filter(file => file.type === 'json')
    const jsonChoices = jsonFiles.map(file => file.name).concat(['None'])

    if (scriptName === undefined && scriptType === 'aiken' && validatorChoices.length > 0) {
        setScriptName(validatorChoices[0])
    }

    if (scriptName === undefined && scriptType === 'native' && jsonChoices.length > 0) {
        setScriptName(jsonChoices[0])
    }

    if (paramsFilename === undefined && jsonChoices.length > 0) {
        setParamsFilename(jsonChoices[0])
    }

    const isCreateDisabledClass = (
        (scriptType === 'aiken' && validatorChoices.length === 0) ||
        (scriptType === 'native' && jsonChoices.length === 1)
     ) ? 'disabled' : ''

    return (
        <div className='add-contract-container'>
            <div className='add-contract-header'>Add a Contract</div>
            <div className='add-contract-content'>
                <div className='add-contract-selection-container'>
                    <div className='input-label'>Script Kind </div>
                    <select
                        className='add-contract-select'
                        defaultValue={scriptType}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            setScriptType(e.target.value as ScriptKind)
                        }}
                    >
                        <option value='aiken'>Aiken</option>
                        <option value='native'>Native Script</option>
                    </select>
                </div>

                <div className='add-contract-selection-container'>
                    <div className='input-label'>Validator </div>
                    {
                        scriptType === 'aiken' ?
                            (
                                <select
                                    className='add-contract-select'
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                        setScriptName(e.target.value)
                                    }}
                                >
                                    {validatorChoices?.map((validatorName, index) =>
                                        <option
                                            value={validatorName}
                                            key={validatorName + index} // name alone might not be unique as we build multiple files separately
                                        >{validatorName}
                                        </option>
                                    )}
                                </select>
                            ) : (
                                <select
                                    className='add-contract-select'
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                        setScriptName(e.target.value)
                                    }}
                                >
                                    {jsonChoices?.map(fileName => {
                                        if (fileName === 'None') {
                                            return null
                                        }

                                        return (
                                            <option
                                                value={fileName}
                                                key={fileName}
                                            >
                                                {fileName}
                                            </option>
                                        )
                                    })}
                                </select>
                            )
                    }
                </div>

                <div className='add-contract-selection-container'>
                    {scriptType === 'aiken' ? <div className='input-label'>Params </div> : null}
                    {scriptType === 'aiken' ?
                        (
                            <select
                                className='add-contract-select'
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                    setParamsFilename(e.target.value)
                                }}
                            >
                                {jsonChoices?.map(fileName =>
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

            <div className='add-contract-selection-container add-contract-button-container'>
                    <div></div>
                    <button
                        ref={addButtonRef}
                        className={`add-contract-button button ${isCreateDisabledClass}`}
                        onClick={() => {
                            if (scriptType === 'aiken') {
                                const paramsJsonFile = jsonFiles.find(jsonFile => jsonFile.name === paramsFilename)
                                const paramsJson = paramsJsonFile?.content
                                const validator = validators?.find(v => v.name === scriptName) || validators?.[0]

                                if (!validator) {
                                    console.error(`No known validator ${scriptName}`)   // shouldnt ever happen tbh
                                    return
                                }

                                let params: Data[] = []

                                if (paramsJson) {
                                    try {
                                        const jsonParams = JSON.parse(paramsJson)
                                        params = constructObject(jsonParams)
                                    } catch (e: any) {
                                        if (e.message && e.message.includes('JSON.parse')) {
                                            return dispatch(setAddContractError(`Invalid JSON in ${paramsJsonFile.name}`))
                                        } else {
                                            return dispatch(setAddContractError(`JSON in ${paramsJsonFile.name} cannot be converted to Data`))
                                        }
                                    }
                                }

                                const parameterizedValidator = {
                                    type: 'PlutusV2',
                                    script: applyDoubleCborEncoding(
                                        applyParamsToScript(
                                            validator.program, params
                                        )
                                    )
                                } as Script
                                const address = lucid.utils.validatorToAddress(parameterizedValidator)
                                const scriptHash = lucid.utils.validatorToScriptHash(parameterizedValidator)

                                dispatch(addContract({
                                    script: parameterizedValidator,
                                    name: validator.name,
                                    paramsFileName: paramsJsonFile?.name || 'None',
                                    address,
                                    scriptHash
                                }))
                            } else if (scriptType === 'native') {
                                const nativeScriptJsonFile = jsonFiles.find(jsonFile => jsonFile.name === scriptName)
                                const nativeScriptJson = nativeScriptJsonFile?.content
                                if (nativeScriptJson) {
                                    try {
                                        const parsedNativeScriptJson = JSON.parse(nativeScriptJson)
                                        const parameterizedValidator = lucid.utils.nativeScriptFromJson(parsedNativeScriptJson)
                                        const address = lucid.utils.validatorToAddress(parameterizedValidator)
                                        const scriptHash = lucid.utils.validatorToScriptHash(parameterizedValidator)
                                        dispatch(addContract({
                                            script: parameterizedValidator,
                                            name: scriptName!!.split('.')[0],
                                            paramsFileName: nativeScriptJsonFile?.name,
                                            address,
                                            scriptHash
                                        }))
                                    } catch (e: any) {
                                        if (e.message && e.message.includes('JSON.parse')) {
                                            return dispatch(setAddContractError(`Invalid JSON in ${nativeScriptJsonFile.name}`))
                                        } else {
                                            return dispatch(setAddContractError(`JSON in ${nativeScriptJsonFile.name} is not a valid native script`))
                                        }
                                    }
                                }
                            }

                        }}
                    >Create Contract</button>
                </div>
        </div>
    )
}

export { AddContract }