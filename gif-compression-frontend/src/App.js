import React, { useState } from 'react'
import { InboxOutlined } from '@ant-design/icons'
import { Upload, message, Form, Input, Button } from 'antd'
import axios from 'axios'

const { Dragger } = Upload

function App() {
  const [form] = Form.useForm()
  const [filePath, setFilePath] = useState('')
  const [fileName, setFileName] = useState('')

  const onCompress = async (values) => {
    console.log(values)
    console.log(filePath)
    const res = await axios.get('http://localhost:3300/compression', {
      params: {
        color: values.color || 256,
        level: values.leval || 9,
        path: filePath,
      },
      responseType: 'arraybuffer',
    })
    const blob = new Blob([res.data], { type: 'image/jpeg' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()

    message.success('压缩成功')
  }

  const props = {
    name: 'file',
    multiple: true,
    action: 'http://localhost:3300/upload',
    onChange(info) {
      const { status } = info.file
      if (status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (status === 'done') {
        setFilePath(info.file.response)
        setFileName(info.file.name)
        message.success(`${info.file.name} file uploaded successfully.`)
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`)
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files)
    },
  }

  return (
    <div>
      <Form style={{ width: 500, margin: '50px auto' }} form={form} onFinish={onCompress}>
        <Form.Item label='颜色数量' name='color'>
          <Input />
        </Form.Item>
        <Form.Item label='压缩级别' name='levle'>
          <Input />
        </Form.Item>
        <Form.Item>
          <Dragger {...props}>
            <p className='ant-upload-drag-icon'>
              <InboxOutlined />
            </p>
            <p className='ant-upload-text'>点击或拖拽文件到这个区域来上传</p>
          </Dragger>
        </Form.Item>
        <Form.Item>
          <Button type='primary' htmlType='submit'>
            压缩
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default App
