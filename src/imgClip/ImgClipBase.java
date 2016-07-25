package imgClip;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.File;
import java.net.URLDecoder;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.*;

import imgClip.action.Base64ToImg;
import imgClip.action.ImgCompressUtil;

public class ImgClipBase extends HttpServlet {

	/**
	 * Constructor of the object.
	 */
	public ImgClipBase() {
		super();
	}

	/**
	 * Destruction of the servlet. <br>
	 */
	public void destroy() {
		super.destroy(); // Just puts "destroy" string in log
		// Put your code here
	}

	/**
	 * The doGet method of the servlet. <br>
	 *
	 * This method is called when a form has its tag value method equals to get.
	 * 
	 * @param request the request send by the client to the server
	 * @param response the response send by the server to the client
	 * @throws ServletException if an error occurred
	 * @throws IOException if an error occurred
	 */
	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		doPost(request,response);
	}

	/**
	 * The doPost method of the servlet. <br>
	 *
	 * This method is called when a form has its tag value method equals to post.
	 * 
	 * @param request the request send by the client to the server
	 * @param response the response send by the server to the client
	 * @throws ServletException if an error occurred
	 * @throws IOException if an error occurred
	 */
	@SuppressWarnings("unused")
	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String actionName=request.getParameter("actionName");
		String rootPath = getServletContext().getRealPath("//") + "/";
		switch(actionName)
		{
			case "saveImage":
				String base64img=request.getParameter("base64img");
				String imgPath=request.getParameter("imgPath");
				Base64ToImg bti=new Base64ToImg();
				bti.GenerateImage(base64img, imgPath,rootPath);
				
				response.setCharacterEncoding("UTF-8");
				//返回路径
				response.getWriter().write(imgPath);
				break;
			case "clipImage":
				String clipImgInfo=URLDecoder.decode(request.getParameter("jsonObj"),"UTF-8");
				String savePath=request.getParameter("savePath");
				//转换json对象
				try {
					JSONObject jb=new JSONObject(clipImgInfo);
					String sourceImgSrc = (String) jb.get("imgSrc");//原始图片的路径
					int zoomImgWidth = (int) jb.get("imgWidth");//缩放的图片宽度
					int zoomImgHeight = (int) jb.get("imgHeight");//缩放的图片高度
					int clipWidth = (int) jb.get("clipWidth");//裁剪的宽度
					int clipHeight = (int) jb.get("clipHeight");//裁剪的高度
					int x = (int) jb.get("x");//裁剪的左边的X坐标
					int y = (int) jb.get("y");//裁剪的左边的Y坐标
					int rotateAngle=(int)jb.get("rotateAngle");//选择角度，数值为0，90，180，270
					String RotateImgPath=rootPath+ImgCompressUtil.getFilePathNoFileName(sourceImgSrc)+"rotate_"+ImgCompressUtil.getFileNameHasEx(sourceImgSrc);
					boolean isrotateOk=true;
					//是否有旋转图片
					if(rotateAngle>0)
					{
						if(ImgCompressUtil.RotateImage(rootPath+sourceImgSrc, rotateAngle, RotateImgPath))
						{
							sourceImgSrc=ImgCompressUtil.getFilePathNoFileName(sourceImgSrc)+"rotate_"+ImgCompressUtil.getFileNameHasEx(sourceImgSrc);
						}else
						{
							isrotateOk=false;
						}
					}
					
					
					//如果要裁剪成100的，需要对整体进行缩放,x/y坐标重新按比例计算
					double rateW=((double)clipWidth)/100;
					double rateH=((double)clipHeight)/100;
					zoomImgWidth=(int)(((double)zoomImgWidth)/rateW);
					zoomImgHeight=(int)(((double)zoomImgHeight)/rateH);
					x=(int)(((double)x)/rateW);
					y=(int)(((double)y)/rateH);
					clipWidth=100;
					clipHeight=100;
					
					
					//只支持缩放后存储为jpg类型
					String ZoomImgPath=rootPath+ImgCompressUtil.getFilePathNoFileName(sourceImgSrc)+"zoom_"+ImgCompressUtil.getFileNameNoEx(sourceImgSrc)+".jpg";
					
					//proportion最好为false，因为前台已经计算了缩放大小
					boolean isCompressOk = ImgCompressUtil.compressPic(rootPath+sourceImgSrc, 
							ZoomImgPath,zoomImgWidth, zoomImgHeight, false);
					
					if(isrotateOk&&isCompressOk)
					{
						if(savePath=="")
						{
							savePath=ImgCompressUtil.getFilePathNoFileName(sourceImgSrc);
						}
						String newImgPath=savePath+ImgCompressUtil.getRandomName()+ImgCompressUtil.getExtensionName(sourceImgSrc);
						//缩放成功，进行裁剪
						boolean isClipOk=ImgCompressUtil.cutPic(ZoomImgPath, rootPath+newImgPath, x, y, clipWidth, clipHeight);
						if(isClipOk)
						{
							//删除缩放的过渡的图片,只保留原图和裁剪后的图片
							File zoomFile=new File(ZoomImgPath);
							zoomFile.delete();
							File rotateFile=new File(RotateImgPath);
							rotateFile.delete();
							//裁剪成功，返回路径
							response.setCharacterEncoding("UTF-8");
							//返回路径
							response.getWriter().write("{status:'ok',msg:'"+newImgPath+"'}");
						}else
						{
							//裁剪失败，返回错误信息
							response.setCharacterEncoding("UTF-8");
							//返回路径
							response.getWriter().write("{status:'error',msg:'图片裁剪失败'}");
						}
					}else if(!isrotateOk)
					{
						//裁剪成功，返回路径
						response.setCharacterEncoding("UTF-8");
						//返回路径
						response.getWriter().write("{status:'error',msg:'旋转图片失败'}");
					}
					else
					{
						//缩放失败，返回错误信息
						response.setCharacterEncoding("UTF-8");
						//返回路径
						response.getWriter().write("{status:'error',msg:'图片压缩失败'}");
					}
					
					
				} catch (JSONException e) {
					// TODO 自动生成的 catch 块
					e.printStackTrace();
				}
				
				break;
		}
		response.flushBuffer(); 
	}

	/**
	 * Initialization of the servlet. <br>
	 *
	 * @throws ServletException if an error occurs
	 */
	public void init() throws ServletException {
		// Put your code here
	}

}
