import {Component, createSignal, Show} from "solid-js";
import { useToast } from "../../Core/Toast";

const BigSingleFileInput: Component = (props) => {
    const toast = useToast();
    const [loading, setLoading] = createSignal(false);
    const [text,setText] = createSignal<string>('');
    const onInput = async (e) => {
        setText('');
        const files = e.target?.files;
        if (!files || files.length === 0)
            return;
        if(props?.maxSize && files[0].size > props?.maxSize){
            toast.danger(`جداکثر مقدار مجاز فایل ${getMaxSizeText()} است.`);
            return;
        }
        setText(files[0].name);
        if(await props?.onInput(files[0], setLoading) === true)
            setText('');
    }
    const getMaxSizeText = () => {
        const size = props?.maxSize;
        if (!size)
            return '';
        if (size < 1000)
            return `${size}B`
        if (size < 1000000)
            return `${Math.floor(size / 1000)}KB`
        if (size < 1000000000)
            return `${Math.floor(size / 1000_000)}MB`
        return `${Math.floor(size / 1000_000_000)}GB`
    }

    return (
        <>

            <div class="flex items-center justify-center w-full">

                <label
                    class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                        <Show when={!loading()} fallback={
                            <div class="text-center m-3">
                                <div role="status">
                                    <svg aria-hidden="true"
                                         class="inline w-6 h-6 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                         viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                            fill="currentColor"/>
                                        <path
                                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                            fill="currentFill"/>
                                    </svg>
                                    <span class="sr-only">Loading...</span>
                                </div>
                            </div>
                        }>
                            <svg aria-hidden="true" class="w-10 h-10 mb-3 text-gray-400" fill="none"
                                 stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            <p class="mb-2 text-sm text-gray-700 dark:text-gray-700">
                                {text()}
                            </p>
                            <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span
                                class="font-semibold">Click to upload</span> or drag and drop</p>

                            <p class="text-xs text-gray-500 dark:text-gray-400">
                                {props?.accept && Array.isArray(props.accept) ? props.accept.map((v) => `.${v}`).join(', ') : ''}
                                (MAX {props?.maxDimensionText}{props?.maxSize ? ` - ${getMaxSizeText()}` : ''})

                            </p>
                        </Show>
                    </div>
                    <Show when={!loading()}>
                        <Show when={props?.accept && Array.isArray(props.accept)} fallback={
                            <input id="dropzone-file" onChange={onInput} type="file" class="hidden"/>
                        }>
                            <input id="dropzone-file" onChange={onInput} type="file" class="hidden"
                                   accept={props.accept.map((v) => `.${v}`).join(', ')}/>

                        </Show>
                    </Show>
                </label>

            </div>
        </>
    );
}
export default BigSingleFileInput;