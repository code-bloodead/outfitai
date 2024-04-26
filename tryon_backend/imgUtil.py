import base64

def image_to_base64(image_path):
    with open(image_path, "rb") as img_file:
        encoded_string = base64.b64encode(img_file.read())
    return encoded_string.decode('utf-8')
result = [{'image': '/private/var/folders/y2/jtr10xy54vq78gp5lzpmfn640000gn/T/gradio/0e2e99939a1bb59744197f8a23120b38e4a4f1c9/image.png', 'caption': None}]

def gradio_result_to_base64_response(result):
  response = []
  for res_image in result:
    image_path_local = res_image['image']
    base64_string = image_to_base64(image_path_local)
    response.append({
      'image': base64_string,
      'caption': res_image['caption']
    })
  return response
