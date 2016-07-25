/**  
 * @Title: ImgCompressUtil.java
 * @Package imgClip.action
 * @Description: TODO
 * @author Gsz
 * @date 2016-7-5 ����2:21:32
 */
package imgClip.action;

import java.awt.Graphics;
import java.awt.GraphicsConfiguration;
import java.awt.GraphicsDevice;
import java.awt.GraphicsEnvironment;
import java.awt.HeadlessException;
import java.awt.Image;
import java.awt.Rectangle;
import java.awt.Transparency;
import java.awt.image.BufferedImage;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.Random;

import javax.imageio.ImageIO;
import javax.imageio.ImageReadParam;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import javax.swing.ImageIcon;

import com.sun.image.codec.jpeg.JPEGCodec;
import com.sun.image.codec.jpeg.JPEGImageEncoder;

/**
 * ClassName: ImgCompressUtil 
 * @Description: ͼƬ�ļ�����������
 * @author Gsz
 * @date 2016-7-5 ����2:21:32
 */
public class ImgCompressUtil {
	public String path = "";

	public ImgCompressUtil(String path) {
		this.path = path;
	}

	public void change(int size) {
		compressImg(new File(path), size, null);
	}
	
	/**
	 * @Description: ��תͼƬ
	 * @param @param inputFile
	 * @param @param angel
	 * @param @param outFile
	 * @param @return   
	 * @return boolean  
	 * @throws
	 * @author Gsz
	 * @date 2016-7-8 ����12:19:22
	 */
	public static boolean RotateImage(String inputFile, int angel,String outFile) {

		File file = new File(inputFile);
		BufferedImage res = null;
		try {
			Image src = ImageIO.read(file);
			int src_width = src.getWidth(null);
			int src_height = src.getHeight(null);
			// calculate the new image size
			Rectangle rect_des = CalcRotatedSize(new Rectangle(new Dimension(
					src_width, src_height)), angel);

			res = new BufferedImage(rect_des.width, rect_des.height,
					BufferedImage.TYPE_INT_RGB);
			Graphics2D g2 = res.createGraphics();
			// transform
			g2.translate((rect_des.width - src_width) / 2,
					(rect_des.height - src_height) / 2);
			g2.rotate(Math.toRadians(angel), src_width / 2, src_height / 2);

			g2.drawImage(src, null, null);
			// ��ȡ�ļ���ʽ
			String ext = inputFile.substring(inputFile.lastIndexOf(".") + 1);

			File tempOutFile = new File(outFile);
			if (!tempOutFile.exists()) {
				tempOutFile.mkdirs();
			}
			ImageIO.write(res, ext, new File(outFile));
		} catch (IOException e) {
			// TODO �Զ����ɵ� catch ��
			e.printStackTrace();
			return false;
		}
		return true;
	}

	public static Rectangle CalcRotatedSize(Rectangle src, int angel) {
		// if angel is greater than 90 degree, we need to do some conversion
		if (angel >= 90) {
			if(angel / 90 % 2 == 1){
				int temp = src.height;
				src.height = src.width;
				src.width = temp;
			}
			angel = angel % 90;
		}

		double r = Math.sqrt(src.height * src.height + src.width * src.width) / 2;
		double len = 2 * Math.sin(Math.toRadians(angel) / 2) * r;
		double angel_alpha = (Math.PI - Math.toRadians(angel)) / 2;
		double angel_dalta_width = Math.atan((double) src.height / src.width);
		double angel_dalta_height = Math.atan((double) src.width / src.height);

		int len_dalta_width = (int) (len * Math.cos(Math.PI - angel_alpha
				- angel_dalta_width));
		int len_dalta_height = (int) (len * Math.cos(Math.PI - angel_alpha
				- angel_dalta_height));
		int des_width = src.width + len_dalta_width * 2;
		int des_height = src.height + len_dalta_height * 2;
		return new java.awt.Rectangle(new Dimension(des_width, des_height));
	}
	
	/**
	 * @Description: ��oldfile��ͼƬ�ļ��ȱ���ѹ��Ϊsize��newfile�ļ�
	 * @param @param oldfile
	 * @param @param size
	 * @param @param newfile
	 * @param @return   
	 * @return File  
	 * @throws
	 * @author Gsz
	 * @date 2016-7-5 ����2:27:13
	 */
	public static File compressImg(File oldfile, int size, File newfile) {
		if(!newfile.exists())
			try {
				newfile.createNewFile();
			} catch (IOException e1) {
				// TODO Auto-generated catch block
				//e1.printStackTrace();
				System.out.println("�޷������ļ�������");
				return null;
			}
		BufferedImage bi;
		try {
			System.out.println("����ѹ��:" + oldfile.getName());
			bi = ImageIO.read(new FileInputStream(oldfile));
			int width = bi.getWidth();
			int height = bi.getHeight();
			if (width > size || height > size) {
				Image image;
				if (width > height) {
					height = (int) (bi.getHeight() / (bi.getWidth() * 1d) * size);
					image = bi.getScaledInstance(size, height,
							Image.SCALE_DEFAULT);
				} else {
					width = (int) (bi.getWidth() / (bi.getHeight() * 1d) * size);
					image = bi.getScaledInstance(width, size,
							Image.SCALE_DEFAULT);
				}
				ImageIO.write(toBufferedImage(image), "png",
						new FileOutputStream(newfile));
				System.out.println("ѹ�����:" + newfile.getName());
				return newfile;
			} else {
				System.out.println("����ѹ��:" + oldfile.getName());
				return oldfile;
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	public static BufferedImage toBufferedImage(Image image) {
		if (image instanceof BufferedImage) {
			return (BufferedImage) image;
		}
		image = new ImageIcon(image).getImage();
		BufferedImage bimage = null;
		GraphicsEnvironment ge = GraphicsEnvironment
				.getLocalGraphicsEnvironment();
		try {
			int transparency = Transparency.TRANSLUCENT;
			GraphicsDevice gs = ge.getDefaultScreenDevice();
			GraphicsConfiguration gc = gs.getDefaultConfiguration();
			bimage = gc.createCompatibleImage(image.getWidth(null), image
					.getHeight(null), transparency);
		} catch (HeadlessException e) {
		}
		if (bimage == null) {
			int type = BufferedImage.TYPE_INT_RGB;
			bimage = new BufferedImage(image.getWidth(null), image
					.getHeight(null), type);
		}
		Graphics g = bimage.createGraphics();
		g.drawImage(image, 0, 0, null);
		g.dispose();
		return bimage;
	}

	/**
	 * 
	 * @Description: ����������֣����ظ�(�����ļ�������)
	 * @param @return   
	 * @return String  
	 * @throws
	 * @author Gsz
	 * @date 2016-7-5 ����2:28:19
	 */
	public static String getRandomName() {
		Random r = new Random();
		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd_HHmmssSSS");
		StringBuffer sb = new StringBuffer();
		sb.append(r.nextInt(100));
		sb.append(r.nextInt(100));
		sb.append("_");
		sb.append(sdf.format(new Date()));
		sb.append("_");
		sb.append(r.nextInt(100));
		sb.append(r.nextInt(100));
		return sb.toString();
	}

	/**
	 * 
	 * @Description: �Ƿ�ȱ�������ͼƬ
	 * @param @param inputFileԴ�ļ�
	 * @param @param outFile�����ļ�
	 * @param @param widthָ�����
	 * @param @param heightָ���߶�
	 * @param @param proportion�Ƿ�ȱ�������
	 * @param @return   
	 * @return boolean  
	 * @throws
	 * @author Gsz
	 * @date 2016-7-5 ����2:29:01
	 */
	public static boolean compressPic(String inputFile, String outFile,
			int width, int height, boolean proportion) {
		try {
			// ���Դ�ļ�
			File file = new File(inputFile);
			if (!file.exists()) {
				return false;
			}
			Image img = ImageIO.read(file);
			// �ж�ͼƬ��ʽ�Ƿ���ȷ
			if (img.getWidth(null) == -1) {
				return false;
			} else {
				int newWidth;
				int newHeight;
				// �ж��Ƿ��ǵȱ�����
				if (proportion == true) {
					// Ϊ�ȱ����ż��������ͼƬ��ȼ��߶�
					double rate1 = ((double) img.getWidth(null))
							/ (double) width + 0.1;
					double rate2 = ((double) img.getHeight(null))
							/ (double) height + 0.1;
					// �������ű��ʴ�Ľ������ſ���
					double rate = rate1 > rate2 ? rate1 : rate2;
					newWidth = (int) (((double) img.getWidth(null)) / rate);
					newHeight = (int) (((double) img.getHeight(null)) / rate);
				} else {
					newWidth = width; // �����ͼƬ���
					newHeight = height; // �����ͼƬ�߶�
				}

				// ���ͼƬС��Ŀ��ͼƬ�Ŀ�͸��򲻽���ת��
				/*
				 * if (img.getWidth(null) < width && img.getHeight(null) <
				 * height) { newWidth = img.getWidth(null); newHeight =
				 * img.getHeight(null); }
				 */
				BufferedImage tag = new BufferedImage((int) newWidth,
						(int) newHeight, BufferedImage.TYPE_INT_RGB);

				// Image.SCALE_SMOOTH �������㷨 ��������ͼƬ��ƽ���ȵ�,���ȼ����ٶȸ� ���ɵ�ͼƬ�����ȽϺ� ���ٶ���
				tag.getGraphics().drawImage(
						img.getScaledInstance(newWidth, newHeight,
								Image.SCALE_SMOOTH), 0, 0, null);
				FileOutputStream out = new FileOutputStream(outFile);
				// JPEGImageEncoder������������ͼƬ���͵�ת��
				JPEGImageEncoder encoder = JPEGCodec.createJPEGEncoder(out);
				encoder.encode(tag);
				out.close();
			}
		} catch (IOException ex) {
			ex.printStackTrace();
		}
		return true;
	}

	/**
	 * 
	 * @Description: �ü�ͼƬ
	 * @param @param srcFileԴ�ļ�
	 * @param @param outFile����ļ�
	 * @param @param x����
	 * @param @param y����
	 * @param @param width���
	 * @param @param height�߶�
	 * @param @return   
	 * @return boolean  
	 * @throws
	 * @author Gsz
	 * @date 2016-7-5 ����2:30:03
	 */
	public static boolean cutPic(String srcFile, String outFile, int x, int y,
			int width, int height) {
		FileInputStream is = null;
		ImageInputStream iis = null;
		try {
			// ���ԴͼƬ������
			if (!new File(srcFile).exists()) {
				return false;
			}

			// ��ȡͼƬ�ļ�
			is = new FileInputStream(srcFile);

			// ��ȡ�ļ���ʽ
			String ext = srcFile.substring(srcFile.lastIndexOf(".") + 1);

			// ImageReader�����ܹ�����ָ����ʽ
			Iterator<ImageReader> it = ImageIO.getImageReadersByFormatName(ext);
			ImageReader reader = it.next();

			// ��ȡͼƬ��
			iis = ImageIO.createImageInputStream(is);

			// ����Դ�е�ͼ��ֻ��˳���ȡ
			reader.setInput(iis, true);

			// ������ζ������н���
			ImageReadParam param = reader.getDefaultReadParam();

			// ͼƬ�ü�����
			Rectangle rect = new Rectangle(x, y, width, height);

			// �ṩһ�� BufferedImage���������������������ݵ�Ŀ��
			param.setSourceRegion(rect);

			// ʹ�����ṩ�� ImageReadParam ��ȡͨ������ imageIndex ָ���Ķ���
			BufferedImage bi = reader.read(0, param);

			// ������ͼƬ
			File tempOutFile = new File(outFile);
			if (!tempOutFile.exists()) {
				tempOutFile.mkdirs();
			}
			ImageIO.write(bi, ext, new File(outFile));
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		} finally {
			try {
				if (is != null) {
					is.close();
				}
				if (iis != null) {
					iis.close();
				}
			} catch (IOException e) {
				e.printStackTrace();
				return false;
			}
		}
	}

	/**
	 * 
	 * @Description: �����������ݱ�������λת����int��
	 * @param @param doubleValue
	 * @param @return   
	 * @return Integer  
	 * @throws
	 * @author Gsz
	 * @date 2016-7-5 ����2:30:49
	 */
	public static Integer getRoundIntFromDouble(Double doubleValue) {
		return Integer.parseInt(String.valueOf(Math.round(doubleValue)));
	}
	
	/**
	 * @Description: ��ȡ�ļ���չ��
	 * @param @param filename
	 * @param @return   
	 * @return String  
	 * @throws
	 * @author Gsz
	 * @date 2016-7-5 ����2:59:34
	 */
    public static String getExtensionName(String filename) { 
        if ((filename != null) && (filename.length() > 0)) { 
            int dot = filename.lastIndexOf('.'); 
            if ((dot >-1) && (dot < (filename.length() - 1))) { 
                return filename.substring(dot); 
            } 
        } 
        return filename; 
    }
    /**
     * @Description: ��ȡ������չ�����ļ���
     * @param @param filename
     * @param @return   
     * @return String  
     * @throws
     * @author Gsz
     * @date 2016-7-5 ����3:00:02
     */
    public static String getFileNameNoEx(String filename) { 
        if ((filename != null) && (filename.length() > 0)) { 
        	filename = filename.substring(filename.lastIndexOf("/")+1);
            int dot = filename.lastIndexOf('.'); 
            if ((dot >-1) && (dot < (filename.length()))) { 
                return filename.substring(0, dot); 
            }
        }
        return filename; 
    }
    
    /**
     * @Description: ��ȡ����չ�����ļ���
     * @param @param filename
     * @param @return   
     * @return String  
     * @throws
     * @author Gsz
     * @date 2016-7-5 ����3:27:45
     */
    public static String getFileNameHasEx(String filename)
    {
        if ((filename != null) && (filename.length() > 0)) { 
        	filename = filename.substring(filename.lastIndexOf("/")+1);
        }
        return filename; 
    }
    
    /**
     * @Description: ��ȡ·���������ļ�����·��
     * @param @param filepath
     * @param @return   
     * @return String  
     * @throws
     * @author Gsz
     * @date 2016-7-5 ����3:16:46
     */
    public static String getFilePathNoFileName(String filepath)
    {
    	if((filepath != null) && (filepath.length() > 0)) { 
    		filepath = filepath.substring(0,filepath.lastIndexOf("/")+1);
    	}
    	return filepath;
    }
}
