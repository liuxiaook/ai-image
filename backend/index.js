require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.VOLC_API_KEY;
const API_URL = process.env.VOLC_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/images/generations';

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 历史记录存储
const HISTORY_FILE = path.join(__dirname, 'history.json');
if (!fs.existsSync(HISTORY_FILE)) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify([]));
}

// 调用火山Coding Plan API
async function callVolcAPI(params) {
  const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  };
  
  const response = await axios.post(API_URL, params, { headers });
  return response.data;
}

// 文生图接口
app.post('/api/text-to-image', async (req, res) => {
  try {
    const { prompt, style, size = '1024x1024' } = req.body;
    const fullPrompt = style === 'general' ? prompt : `${prompt}, 风格: ${style}`;
    
    const params = {
      model: 'doubao-ai-image-v1', // 火山Coding Plan默认图像生成模型
      prompt: fullPrompt,
      size: size,
      n: 1,
      response_format: 'url'
    };
    
    const response = await callVolcAPI(params);
    const imageUrl = response.data[0].url;
    
    // 保存到历史记录
    const history = JSON.parse(fs.readFileSync(HISTORY_FILE));
    const record = {
      id: Date.now(),
      type: 'text-to-image',
      prompt,
      style,
      size,
      imageUrl,
      createTime: new Date().toISOString()
    };
    history.unshift(record);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history));
    
    res.json({ success: true, data: record });
  } catch (error) {
    console.error('文生图错误:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: error.response?.data?.error?.message || '生成失败' });
  }
});

// 图生图接口
app.post('/api/image-to-image', async (req, res) => {
  try {
    const { imageUrl, prompt, strength = 0.75, size = '1024x1024' } = req.body;
    
    const params = {
      model: 'doubao-ai-image-v1',
      prompt: prompt,
      image: imageUrl,
      strength: strength,
      size: size,
      n: 1,
      response_format: 'url'
    };
    
    const response = await callVolcAPI(params);
    const generatedImageUrl = response.data[0].url;
    
    // 保存到历史记录
    const history = JSON.parse(fs.readFileSync(HISTORY_FILE));
    const record = {
      id: Date.now(),
      type: 'image-to-image',
      prompt,
      strength,
      size,
      sourceImageUrl: imageUrl,
      imageUrl: generatedImageUrl,
      createTime: new Date().toISOString()
    };
    history.unshift(record);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history));
    
    res.json({ success: true, data: record });
  } catch (error) {
    console.error('图生图错误:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: error.response?.data?.error?.message || '生成失败' });
  }
});

// 高清放大接口
app.post('/api/upscale', async (req, res) => {
  try {
    const { imageUrl, scale = 2 } = req.body;
    const targetSize = scale === 2 ? '2048x2048' : scale === 4 ? '4096x4096' : '8192x8192';
    
    const params = {
      model: 'doubao-ai-image-upscale-v1', // 高清放大模型
      image: imageUrl,
      scale: scale,
      size: targetSize,
      response_format: 'url'
    };
    
    const response = await callVolcAPI(params);
    const upscaledImageUrl = response.data[0].url;
    
    // 保存到历史记录
    const history = JSON.parse(fs.readFileSync(HISTORY_FILE));
    const record = {
      id: Date.now(),
      type: 'upscale',
      scale,
      sourceImageUrl: imageUrl,
      imageUrl: upscaledImageUrl,
      createTime: new Date().toISOString()
    };
    history.unshift(record);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history));
    
    res.json({ success: true, data: record });
  } catch (error) {
    console.error('高清放大错误:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: error.response?.data?.error?.message || '放大失败' });
  }
});

// 风格转换接口
app.post('/api/style-transfer', async (req, res) => {
  try {
    const { imageUrl, style } = req.body;
    const styleMap = {
      'anime': '动漫风格',
      'photorealistic': '写实风格',
      'watercolor': '水彩画风格',
      'oil-painting': '油画风格',
      'cyberpunk': '赛博朋克风格',
      'pixel-art': '像素画风格',
      'sketch': '素描风格',
      'general': '通用风格'
    };
    
    const params = {
      model: 'doubao-ai-image-style-v1', // 风格转换模型
      image: imageUrl,
      prompt: `将这张图片转换为${styleMap[style] || style}`,
      strength: 0.8,
      n: 1,
      response_format: 'url'
    };
    
    const response = await callVolcAPI(params);
    const styledImageUrl = response.data[0].url;
    
    // 保存到历史记录
    const history = JSON.parse(fs.readFileSync(HISTORY_FILE));
    const record = {
      id: Date.now(),
      type: 'style-transfer',
      style,
      sourceImageUrl: imageUrl,
      imageUrl: styledImageUrl,
      createTime: new Date().toISOString()
    };
    history.unshift(record);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history));
    
    res.json({ success: true, data: record });
  } catch (error) {
    console.error('风格转换错误:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: error.response?.data?.error?.message || '风格转换失败' });
  }
});

// 历史记录接口
app.get('/api/history', (req, res) => {
  try {
    const history = JSON.parse(fs.readFileSync(HISTORY_FILE));
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取历史记录失败' });
  }
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});