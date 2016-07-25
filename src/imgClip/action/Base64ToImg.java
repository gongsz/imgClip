/**  
 * @Title: Base64ToImg.java
 * @Package imgClip.action
 * @Description: TODO
 * @author Gsz
 * @date 2016-7-4 ����5:57:13
 */
package imgClip.action;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import javax.servlet.http.HttpServlet;



import sun.misc.BASE64Decoder;
import sun.misc.BASE64Encoder;
/**
 * ClassName: Base64ToImg 
 * @Description: ͼƬת��
 * @author Gsz
 * @date 2016-7-4 ����5:57:13
 */
public class Base64ToImg extends HttpServlet{
	// ͼƬת����base64�ַ���
	public String GetImageStr(String imgPath,String rootPath) {
		// ��ͼƬ�ļ�ת��Ϊ�ֽ������ַ��������������Base64���봦��
		String imgFile = rootPath + imgPath;// �������ͼƬ
		InputStream in = null;
		byte[] data = null;
		// ��ȡͼƬ�ֽ�����
		try {
			in = new FileInputStream(imgFile);
			data = new byte[in.available()];
			in.read(data);
			in.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
		// ���ֽ�����Base64����
		BASE64Encoder encoder = new BASE64Encoder();
		return encoder.encode(data);// ����Base64��������ֽ������ַ���
	}

	// base64�ַ���ת����ͼƬ
	public boolean GenerateImage(String imgStr,String imgPath,String rootPath) { 
		// ���ֽ������ַ�������Base64���벢����ͼƬ
		if (imgStr == null) // ͼ������Ϊ��
			return false;
		BASE64Decoder decoder = new BASE64Decoder();
		try {
			// Base64����
			byte[] b = decoder.decodeBuffer(imgStr);
			for (int i = 0; i < b.length; ++i) {
				if (b[i] < 0) {// �����쳣����
					b[i] += 256;
				}
			}
			// ����jpegͼƬ
			String imgFilePath = rootPath + imgPath;// �����ɵ�ͼƬ
			OutputStream out = new FileOutputStream(imgFilePath);
			out.write(b);
			out.flush();
			out.close();
			return true;
		} catch (Exception e) {
			return false;
		}
	}
}
