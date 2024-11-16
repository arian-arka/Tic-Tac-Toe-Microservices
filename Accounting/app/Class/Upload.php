<?php
namespace App\Class;

use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Storage;

class Upload{
    private $_nameGenerator;

    public function nameGenerator($callback){
        $this->_nameGenerator = $callback;
        return $this;
    }

    public static function instance(string $path){
        return (new Upload)->path($path);
    }

    protected $storage;

    public function path(string $path )
    {
        $this->storage = Storage::build([
            'driver' => 'local',
            'root' => $path,
        ]);
        return $this;
    }

    public function deleteFiles($files){
        foreach ($files as $file)
            $this->storage->delete($file['name']);
        return $this;
    }

    protected function singleUpload($f){
        $ext = $f->getClientOriginalExtension();
        $name = substr($f->getClientOriginalName(), 0, strrpos($f->getClientOriginalName(), $ext) - 1);
        $newName = ($this->_nameGenerator)($name,$ext);
        try{
            $path = $this->storage->putFileAs('', $f, $newName);

            return [
                'file' => [
                    'ext' => $ext,
                    'originalName' => $name,
                    'name' => $newName,
                    'path' => $path,
                    'size' => $f->getSize(),
                ],
                'hasError' => false,
                'empty' => false,
            ];
        }catch (\Exception|\Throwable $e){
            return [
                'errors' => [
                    'exception' => $e->getMessage()
                ],
                'exception' => $e,
                'hasError'=> true,
            ];
        }
    }

    public function make($file){
        if(!Request::hasFile($file))
            return [
                'empty' => true,
                'hasError'=> false,
            ];
        $f = Request::file($file);
        if(is_array($f)){
            if(!count($f))
                return [
                    'empty' => true,
                    'hasError'=> false,
                ];
            $files = [];
            foreach ($f as $key => $_f){
                $_ = $this->singleUpload($_f);
                if($_['hasError']){
                    $this->deleteFiles($files);
                    return $_;
                }
                $files[] = $_['file'];
            }
            return [
                'files' => $files,
                'single' => false,
                'hasError' => false,
                'empty' => false
            ];
        }else{
            $_ = $this->singleUpload($f);
            if($_['hasError'])
                return $_;
            $_['single'] = true;
            return $_;
        }
    }

}
