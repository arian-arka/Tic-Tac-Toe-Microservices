import {Component, Show} from "solid-js";

export interface TextInputInterface {
    type?: 'text' | 'password' | 'textarea' | 'email',
    floating?: boolean,
    label?: string,
    placeholder?: string,
    value?: string,
    error?: string,
    onChange?: (val: string) => void,
    onInput?: (val: string) => void,
    rows?: number,
}

const labelClass = `block mb-2 text-sm font-medium text-gray-900 `;
const invalidatedLabelClass = `block mb-2 text-sm font-medium text-red-700 `;
const inputClass = `bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`;
const invalidatedInputClass = `bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500  focus:border-red-500 block w-full p-2.5 `;
const inputAreaClass = `bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 `;
const invalidatedInputAreaClass = `block p-2.5 w-full text-sm text-gray-900 bg-red-50 rounded-lg border border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500  `;
const floatingInputClass = "block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer";
const invalidatedFloatingInputClass = "block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-red-500 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer";
const TextInput: Component = (props: TextInputInterface) => {
    return (
        <>
            <Show when={!!props?.floating} fallback={
                <Show when={props.type === 'textarea'} fallback={
                    <div class="mb-6">
                        <label class={!!props?.error ? invalidatedLabelClass : labelClass}>
                            {props?.label ?? ''}
                        </label>
                        <input type={props?.type ?? 'text'} value={props?.value ?? ''}
                               onChange={async (e) => !!props?.onChange  ? await props.onChange(e.target.value): null}
                               onInput={async (e) => !!props?.onInput  ? await props.onInput(e.target.value) : null}
                               class={!!props?.error ? invalidatedInputClass : inputClass}
                               placeholder={props?.placeholder ?? ''}/>
                        <Show when={!!props?.error}>
                            <p class="mt-2 text-sm text-red-600 ">{props.error}</p>
                        </Show>
                    </div>
                }>
                    <div class="mb-6">
                        <label class={!!props?.error ? invalidatedLabelClass : labelClass}>
                            {props?.label ?? ''}
                        </label>
                        <textarea rows={props?.rows ?? 4}
                                  onChange={async (e) => !!props?.onChange  ? await props.onChange(e.target.value): null}
                                  onInput={async (e) => !!props?.onInput  ? await props.onInput(e.target.value) : null}
                                  class={!!props?.error ? invalidatedInputAreaClass : inputAreaClass}
                                  placeholder={props?.placeholder ?? ''}>{props?.value ?? ''}</textarea>
                        <Show when={!!props?.error}>
                            <p class="mt-2 text-sm text-red-600 ">{props.error}</p>
                        </Show>
                    </div>
                </Show>

            }>
                <div class="relative z-0 w-full mb-6 group">
                    <input type={props?.type ?? 'text'} value={props?.value ?? ''}
                           onChange={async (e) => !!props?.onChange  ? await props.onChange(e.target.value): null}
                           onInput={async (e) => !!props?.onInput  ? await props.onInput(e.target.value) : null}
                           class={!!props?.error ? invalidatedFloatingInputClass : floatingInputClass}
                           placeholder=" "
                    />
                    <label
                        class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                        {props?.label ?? ''}
                    </label>
                    <Show when={!!props?.error}>
                        <p class="mt-2 text-sm text-red-600 ">{props.error}</p>
                    </Show>
                </div>
            </Show>
        </>
    )
        ;
}
export default TextInput;