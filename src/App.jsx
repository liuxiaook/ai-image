import { useState, useEffect } from 'react';
import { Tabs, Input, Select, Button, Upload, Card, Space, message, Spin, Image } from 'antd';
import { DownloadOutlined, HistoryOutlined, PictureOutlined, FileTextOutlined, HighlightOutlined, BgColorsOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import './App.css';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function App() {
  const [activeTab, setActiveTab] = useState('text-to-image');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [history, setHistory] = useState([]);

  // 文生图参数
  const [textPrompt, setTextPrompt] = useState('');
  const [textStyle, setTextStyle] = useState('general');
  const [textSize, setTextSize] = useState('1024x1024');

  // 图生图参数
  const [sourceImageUrl, setSourceImageUrl] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [strength, setStrength] = useState(0.75);
  const [imageSize, setImageSize] = useState('1024x1024');

  // 高清放大参数
  const [upscaleImageUrl, setUpscaleImageUrl] = useState('');
  const [scale, setScale] = useState(2);

  // 风格转换参数
  const [styleImageUrl, setStyleImageUrl] = useState('');
  const [targetStyle, setTargetStyle] = useState('anime');

  const styleOptions = [
    { value: 'general', label: '通用' },
    { value: 'anime', label: '动漫' },
    { value: 'photorealistic', label: '写实' },
    { value: 'watercolor', label: '水彩' },
    { value: 'oil-painting', label: '油画' },
    { value: 'cyberpunk', label: '赛博朋克' },
    { value: 'pixel-art', label: '像素画' },
    { value: 'sketch', label: '素描' }
  ];

  const sizeOptions = [
    { value: '512x512', label: '512x512' },
    { value: '768x768', label: '768x768' },
    { value: '1024x1024', label: '1024x1024' },
    { value: '1024x1792', label: '1024x1792 (竖屏)' },
    { value: '1792x1024', label: '1792x1024 (横屏)' }
  ];

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/history`);
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (error) {
      console.error('加载历史失败:', error);
    }
  };

  const handleTextToImage = async () => {
    if (!textPrompt.trim()) {
      message.error('请输入描述词');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/text-to-image`, {
        prompt: textPrompt,
        style: textStyle,
        size: textSize
      });
      if (res.data.success) {
        setGeneratedImage(res.data.data.imageUrl);
        message.success('生成成功');
        loadHistory();
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error('生成失败: ' + error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageToImage = async () => {
    if (!sourceImageUrl) {
      message.error('请上传参考图片');
      return;
    }
    if (!imagePrompt.trim()) {
      message.error('请输入描述词');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/image-to-image`, {
        imageUrl: sourceImageUrl,
        prompt: imagePrompt,
        strength,
        size: imageSize
      });
      if (res.data.success) {
        setGeneratedImage(res.data.data.imageUrl);
        message.success('生成成功');
        loadHistory();
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error('生成失败: ' + error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpscale = async () => {
    if (!upscaleImageUrl) {
      message.error('请上传需要放大的图片');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/upscale`, {
        imageUrl: upscaleImageUrl,
        scale
      });
      if (res.data.success) {
        setGeneratedImage(res.data.data.imageUrl);
        message.success('放大成功');
        loadHistory();
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error('放大失败: ' + error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStyleTransfer = async () => {
    if (!styleImageUrl) {
      message.error('请上传需要转换风格的图片');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/style-transfer`, {
        imageUrl: styleImageUrl,
        style: targetStyle
      });
      if (res.data.success) {
        setGeneratedImage(res.data.data.imageUrl);
        message.success('风格转换成功');
        loadHistory();
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error('风格转换失败: ' + error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const uploadProps = {
    name: 'file',
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76', // 这里替换为你的图片上传接口
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`);
        const imageUrl = info.file.response.url; // 根据实际返回结构调整
        if (activeTab === 'image-to-image') setSourceImageUrl(imageUrl);
        if (activeTab === 'upscale') setUpscaleImageUrl(imageUrl);
        if (activeTab === 'style-transfer') setStyleImageUrl(imageUrl);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };

  return (
    <div className="app">
      <header className="header">
        <h1>AI 图像生成工具</h1>
        <p>基于火山引擎AI模型，支持文生图、图生图、高清放大、风格转换</p>
      </header>

      <main className="main">
        <div className="content">
          <Tabs activeKey={activeTab} onChange={setActiveTab} className="tabs">
            <TabPane tab={<span><FileTextOutlined /> 文生图</span>} key="text-to-image">
              <Card className="input-card">
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <TextArea
                    rows={4}
                    placeholder="请输入图片描述词，越详细生成效果越好..."
                    value={textPrompt}
                    onChange={(e) => setTextPrompt(e.target.value)}
                  />
                  <Space size="large">
                    <Select
                      value={textStyle}
                      onChange={setTextStyle}
                      style={{ width: 200 }}
                      placeholder="选择风格"
                    >
                      {styleOptions.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
                    </Select>
                    <Select
                      value={textSize}
                      onChange={setTextSize}
                      style={{ width: 200 }}
                      placeholder="选择尺寸"
                    >
                      {sizeOptions.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
                    </Select>
                  </Space>
                  <Button type="primary" size="large" onClick={handleTextToImage} loading={loading}>
                    生成图片
                  </Button>
                </Space>
              </Card>
            </TabPane>

            <TabPane tab={<span><PictureOutlined /> 图生图</span>} key="image-to-image">
              <Card className="input-card">
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>上传参考图片</Button>
                  </Upload>
                  {sourceImageUrl && <Image width={200} src={sourceImageUrl} />}
                  <TextArea
                    rows={4}
                    placeholder="请输入描述词，描述你想要生成的效果..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                  />
                  <Space size="large">
                    <div>
                      <label>相似度: </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={strength}
                        onChange={(e) => setStrength(parseFloat(e.target.value))}
                        style={{ width: 150, marginLeft: 10 }}
                      />
                      <span style={{ marginLeft: 10 }}>{strength}</span>
                    </div>
                    <Select
                      value={imageSize}
                      onChange={setImageSize}
                      style={{ width: 200 }}
                      placeholder="选择尺寸"
                    >
                      {sizeOptions.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
                    </Select>
                  </Space>
                  <Button type="primary" size="large" onClick={handleImageToImage} loading={loading}>
                    生成图片
                  </Button>
                </Space>
              </Card>
            </TabPane>

            <TabPane tab={<span><HighlightOutlined /> 高清放大</span>} key="upscale">
              <Card className="input-card">
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>上传需要放大的图片</Button>
                  </Upload>
                  {upscaleImageUrl && <Image width={200} src={upscaleImageUrl} />}
                  <Space size="large">
                    <Select
                      value={scale}
                      onChange={setScale}
                      style={{ width: 200 }}
                      placeholder="选择放大倍数"
                    >
                      <Option value={2}>2倍</Option>
                      <Option value={4}>4倍</Option>
                      <Option value={8}>8倍</Option>
                    </Select>
                  </Space>
                  <Button type="primary" size="large" onClick={handleUpscale} loading={loading}>
                    开始放大
                  </Button>
                </Space>
              </Card>
            </TabPane>

            <TabPane tab={<span><BgColorsOutlined /> 风格转换</span>} key="style-transfer">
              <Card className="input-card">
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>上传需要转换的图片</Button>
                  </Upload>
                  {styleImageUrl && <Image width={200} src={styleImageUrl} />}
                  <Select
                    value={targetStyle}
                    onChange={setTargetStyle}
                    style={{ width: 200 }}
                    placeholder="选择目标风格"
                  >
                    {styleOptions.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
                  </Select>
                  <Button type="primary" size="large" onClick={handleStyleTransfer} loading={loading}>
                    开始转换
                  </Button>
                </Space>
              </Card>
            </TabPane>

            <TabPane tab={<span><HistoryOutlined /> 历史记录</span>} key="history">
              <Card className="history-card">
                <div className="history-grid">
                  {history.map(item => (
                    <Card
                      key={item.id}
                      hoverable
                      className="history-item"
                      cover={<img alt="生成图片" src={item.imageUrl} />}
                      actions={[
                        <Button
                          type="text"
                          icon={<DownloadOutlined />}
                          onClick={() => handleDownload(item.imageUrl)}
                        >
                          下载
                        </Button>
                      ]}
                    >
                      <Card.Meta
                        title={item.type === 'text-to-image' ? '文生图' : item.type === 'image-to-image' ? '图生图' : item.type === 'upscale' ? '高清放大' : '风格转换'}
                        description={new Date(item.createTime).toLocaleString()}
                      />
                      {item.prompt && <p className="prompt">{item.prompt}</p>}
                    </Card>
                  ))}
                  {history.length === 0 && <p style={{ textAlign: 'center', color: '#999' }}>暂无历史记录</p>}
                </div>
              </Card>
            </TabPane>
          </Tabs>

          {generatedImage && (
            <Card className="result-card" title="生成结果">
              <Spin spinning={loading}>
                <div className="result-content">
                  <Image src={generatedImage} alt="生成结果" style={{ maxWidth: '100%', maxHeight: 600 }} />
                  <div style={{ marginTop: 20 }}>
                    <Button type="primary" icon={<DownloadOutlined />} onClick={() => handleDownload(generatedImage)}>
                      下载图片
                    </Button>
                  </div>
                </div>
              </Spin>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;