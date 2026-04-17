# 从魔搭下载模型到本地

## 虚拟环境

推荐先安装uv，然后创建虚拟环境，安装

```shell
# unix
curl -LsSf https://astral.sh/uv/install.sh | sh

# windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

```shell
# unix
uv venv --python 3.10

# windows
.venv\Scripts\activate
```

```shell
uv pip install -U modelscope
```

## 下载模型

下载完整模型库，比如4b的模型

```shell
modelscope download --model onnx-community/Qwen3.5-4B-ONNX --local_dir ./Qwen3.5-4B-ONNX
```

qwen3.5-onnx的模型会吧原始精度的模型、q4量化、fp16模型、q4fp16模型都放在一起，一起全部下载可能会太大，下面根据如下配置进行下载

```js
const model = await Qwen3_5ForConditionalGeneration.from_pretrained(model_id, {
  dtype: {
    embed_tokens: 'q4',
    vision_encoder: 'fp16',
    decoder_model_merged: 'q4',
  },
  device: 'webgpu',
})
```

```shell
modelscope download --model onnx-community/Qwen3.5-0.8B-ONNX --local_dir ./onnx-community/Qwen3.5-0.8B-ONNX config.json configuration.json generation_config.json preprocessor_config.json processor_config.json tokenizer.json tokenizer_config.json onnx/decoder_model_merged_q4.onnx_data onnx/decoder_model_merged_q4.onnx_data_1 onnx/embed_tokens_q4.onnx onnx/embed_tokens_q4.onnx_data onnx/decoder_model_merged_q4.onnx onnx/vision_encoder_fp16.onnx onnx/vision_encoder_fp16.onnx_data
```

```shell
modelscope download --model onnx-community/Qwen3.5-2B-ONNX --local_dir ./onnx-community/Qwen3.5-2B-ONNX config.json configuration.json generation_config.json preprocessor_config.json processor_config.json tokenizer.json tokenizer_config.json onnx/decoder_model_merged_q4.onnx_data onnx/decoder_model_merged_q4.onnx_data_1 onnx/embed_tokens_q4.onnx onnx/embed_tokens_q4.onnx_data onnx/decoder_model_merged_q4.onnx onnx/vision_encoder_fp16.onnx onnx/vision_encoder_fp16.onnx_data
```

```shell
modelscope download --model onnx-community/Qwen3.5-4B-ONNX --local_dir ./onnx-community/Qwen3.5-4B-ONNX config.json configuration.json generation_config.json preprocessor_config.json processor_config.json tokenizer.json tokenizer_config.json onnx/decoder_model_merged_q4.onnx_data onnx/decoder_model_merged_q4.onnx_data_1 onnx/embed_tokens_q4.onnx onnx/embed_tokens_q4.onnx_data onnx/decoder_model_merged_q4.onnx onnx/vision_encoder_fp16.onnx onnx/vision_encoder_fp16.onnx_data
```

```shell
modelscope download --model HuggingFaceTB/SmolLM2-135M-Instruct --local_dir ./HuggingFaceTB/SmolLM2-135M-Instruct all_results.json config.json eval_results.json generation_config.json special_tokens_map.json tokenizer.json tokenizer_config.json train_results.json trainer_state.json vocab.json onnx/model_q4f16.onnx
```
