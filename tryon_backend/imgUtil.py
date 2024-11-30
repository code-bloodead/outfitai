import base64
import datetime

def save_tmp_image_to_static(tmp_image_path, image_path):
    with open(tmp_image_path, "rb") as img_file:
        with open(image_path, "wb") as img_out:
            img_out.write(img_file.read())

def image_to_base64(image_path):
    with open(image_path, "rb") as img_file:
        encoded_string = base64.b64encode(img_file.read())
    return encoded_string.decode('utf-8')

# result = ['/private/var/folders/y2/jtr10xy54vq78gp5lzpmfn640000gn/T/gradio/0e2e99939a1bb59744197f8a23120b38e4a4f1c9/image.png']

def gradio_result_to_base64_response(result: list[str]):
  response = []
  for res_image in result:
    base64_string = image_to_base64(res_image)
    response.append({
      'image': base64_string,
    })
  
  image_extension = result[0].split('.')[-1]
  save_tmp_image_to_static(result[0], f"static/result.{image_extension}")
  save_tmp_image_to_static(result[0], f"static/result_{datetime.datetime.now().timestamp()}.{image_extension}")
  return response
