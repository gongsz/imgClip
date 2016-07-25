/**  
 * @Title: ImgCompressUtil.java
 * @Package imgClip.action
 * @Description: TODO
 * @author Gsz
 * @date 2016-7-5 下午2:21:32
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
 * @Description: 图片文件操作工具类
 * @author Gsz
 * @date 2016-7-5 下午2:21:32
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
	 * @Description: 旋转图片
	 * @param @param inputFile
	 * @param @param angel
	 * @param @param outFile
	 * @param @return   
	 * @return boolean  
	 * @throws
	 * @author Gsz
	 * @date 2016-7-8 下午12:19:22
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
			// 获取文件格式
			String ext = inputFile.substring(inputFile.lastIndexOf(".") + 1);

			File tempOutFile = new File(outFile);
			if (!tempOutFile.exists()) {
				tempOutFile.mkdirs();
			}
			ImageIO.write(res, ext, new File(outFile));
		} catch (IOException e) {
			// TODO 自动生成的 catch 块
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
	 * @Description: 将oldfile的图片文件等比例压缩为size的newfile文件
	 * @param @param oldfile
	 * @param @param size
	 * @param @param newfile
	 * @param @return   
	 * @return File  
	 * @throws
	 * @author Gsz
	 * @date 2016-7-5 下午2:27:13
	 */
	public static File compressImg(File oldfile, int size, File newfile) {
		if(!newfile.exists())
			try {
				newfile.createNewFile();
			} catch (IOException e1) {
				// TODO Auto-generated catch block
				//e1.printStackTrace();
				System.out.println("无法创建文件！！！");
				return null;
			}
		BufferedImage bi;
		try {
			System.out.println("正在压缩:" + oldfile.getName());
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
				System.out.println("压缩完成:" + newfile.getName());
				return newfile;
			} else {
				System.out.println("无须压缩:" + oldfile.getName());
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
	 * @Description: 生成随机名字，不重复(用于文件的命名)
	 * @param @return   
	 * @return String  
	 * @throws
	 * @author Gsz
	 * @date 2016-7-5 下午2:28:19
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
	 * @Description: 是否等比例缩放图片
	 * @param @param inputFile源文件
	 * @param @param outFile生成文件
	 * @param @param width指定宽度
	 * @param @param height指定高度
	 * @param @param proportion是否等比例操作
	 * @param @return   
	 * @return boolean  
	 * @throws
	 * @author Gsz
	 * @date 2016-7-5 下午2:29:01
	 */
	public static boolean compressPic(String inputFile, String outFile,
			int width, int height, boolean proportion) {
		try {
			// 获得源文件
			File file = new File(inputFile);
			if (!file.exists()) {
				return false;
			}
			Image img = ImageIO.read(file);
			// 判断图片格式是否正确
			if (img.getWidth(null) == -1) {
				return false;
			} else {
				int newWidth;
				int newHeight;
				// 判断是否是等比缩放
				if (proportion == true) {
					// 为等比缩放计算输出的图片宽度及高度
					double rate1 = ((double) img.getWidth(null))
							/ (double) width + 0.1;
					double rate2 = ((double) img.getHeight(null))
							/ (double) height + 0.1;
					// 根据缩放比率大的进行缩放控制
					double rate = rate1 > rate2 ? rate1 : rate2;
					newWidth = (int) (((double) img.getWidth(null)) / rate);
					newHeight = (int) (((double) img.getHeight(null)) / rate);
				} else {
					newWidth = width; // 输出的图片宽度
					newHeight = height; // 输出的图片高度
				}

				// 如果图片小于目标图片的宽和高则不进行转换
				/*
				 * if (img.getWidth(null) < width && img.getHeight(null) <
				 * height) { newWidth = img.getWidth(null); newHeight =
				 * img.getHeight(null); }
				 */
				BufferedImage tag = new BufferedImage((int) newWidth,
						(int) newHeight, BufferedImage.TYPE_INT_RGB);

				// Image.SCALE_SMOOTH 的缩略算法 生成缩略图片的平滑度的,优先级比速度高 生成的图片质量比较好 但速度慢
				tag.getGraphics().drawImage(
						img.getScaledInstance(newWidth, newHeight,
								Image.SCALE_SMOOTH), 0, 0, null);
				FileOutputStream out = new FileOutputStream(outFile);
				// JPEGImageEncoder可适用于其他图片类型的转换
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
	 * @Description: 裁剪图片
	 * @param @param srcFile源文件
	 * @param @param outFile输出文件
	 * @param @param x坐标
	 * @param @param y坐标
	 * @param @param width宽度
	 * @param @param height高度
	 * @param @return   
	 * @return boolean  
	 * @throws
	 * @author Gsz
	 * @date 2016-7-5 下午2:30:03
	 */
	public static boolean cutPic(String srcFile, String outFile, int x, int y,
			int width, int height) {
		FileInputStream is = null;
		ImageInputStream iis = null;
		try {
			// 如果源图片不存在
			if (!new File(srcFile).exists()) {
				return false;
			}

			// 读取图片文件
			is = new FileInputStream(srcFile);

			// 获取文件格式
			String ext = srcFile.substring(srcFile.lastIndexOf(".") + 1);

			// ImageReader声称能够解码指定格式
			Iterator<ImageReader> it = ImageIO.getImageReadersByFormatName(ext);
			ImageReader reader = it.next();

			// 获取图片流
			iis = ImageIO.createImageInputStream(is);

			// 输入源中的图像将只按顺序读取
			reader.setInput(iis, true);

			// 描述如何对流进行解码
			ImageReadParam param = reader.getDefaultReadParam();

			// 图片裁剪区域
			Rectangle rect = new Rectangle(x, y, width, height);

			// 提供一个 BufferedImage，将其用作解码像素数据的目标
			param.setSourceRegion(rect);

			// 使用所提供的 ImageReadParam 读取通过索引 imageIndex 指定的对象
			BufferedImage bi = reader.read(0, param);

			// 保存新图片
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
	 * @Description: 将浮点型数据保留整数位转换成int型
	 * @param @param doubleValue
	 * @param @return   
	 * @return Integer  
	 * @throws
	 * @author Gsz
	 * @date 2016-7-5 下午2:30:49
	 */
	public static Integer getRoundIntFromDouble(Double doubleValue) {
		return Integer.parseInt(String.valueOf(Math.round(doubleValue)));
	}
	
	/**
	 * @Description: 获取文件扩展名
	 * @param @param filename
	 * @param @return   
	 * @return String  
	 * @throws
	 * @author Gsz
	 * @date 2016-7-5 下午2:59:34
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
     * @Description: 获取不带扩展名的文件名
     * @param @param filename
     * @param @return   
     * @return String  
     * @throws
     * @author Gsz
     * @date 2016-7-5 下午3:00:02
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
     * @Description: 获取带扩展名的文件名
     * @param @param filename
     * @param @return   
     * @return String  
     * @throws
     * @author Gsz
     * @date 2016-7-5 下午3:27:45
     */
    public static String getFileNameHasEx(String filename)
    {
        if ((filename != null) && (filename.length() > 0)) { 
        	filename = filename.substring(filename.lastIndexOf("/")+1);
        }
        return filename; 
    }
    
    /**
     * @Description: 获取路径不包括文件名的路径
     * @param @param filepath
     * @param @return   
     * @return String  
     * @throws
     * @author Gsz
     * @date 2016-7-5 下午3:16:46
     */
    public static String getFilePathNoFileName(String filepath)
    {
    	if((filepath != null) && (filepath.length() > 0)) { 
    		filepath = filepath.substring(0,filepath.lastIndexOf("/")+1);
    	}
    	return filepath;
    }
}
