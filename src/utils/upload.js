import request from './request'
import toast from './toast'

export const uploadImage = async (field, callback) => {
  // 创建一个 input
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'

  // 监听 input 的 change 事件
  input.addEventListener('change', async () => {
    // 验证是否选择了文件
    if (!input.files || input.files.length === 0) {
      return toast.warning('请选择图片文件')
    }

    // 创建一个 formData
    const params = new FormData()
    params.append('file', input.files[0])

    try {
      // 上传图片
      const { code, msg, data } = await request.post('/api/file/upload', params, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (code !== 200) {
        toast.error(msg)
        return
      }
      
      // 调用回调函数，传递上传成功的路径
      if (typeof callback === 'function') {
        callback(data.path)
      }
      
      toast.success('上传成功！')
    } catch (error) {
      toast.error('图片上传失败，请重试')
    } finally {
      // 清空 input
      input.value = ''
    }
  })

  // 触发 input 的 click 事件
  input.click()
}