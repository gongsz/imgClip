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
				//����·��
				response.getWriter().write(imgPath);
				break;
			case "clipImage":
				String clipImgInfo=URLDecoder.decode(request.getParameter("jsonObj"),"UTF-8");
				String savePath=request.getParameter("savePath");
				//ת��json����
				try {
					JSONObject jb=new JSONObject(clipImgInfo);
					String sourceImgSrc = (String) jb.get("imgSrc");//ԭʼͼƬ��·��
					int zoomImgWidth = (int) jb.get("imgWidth");//���ŵ�ͼƬ���
					int zoomImgHeight = (int) jb.get("imgHeight");//���ŵ�ͼƬ�߶�
					int clipWidth = (int) jb.get("clipWidth");//�ü��Ŀ��
					int clipHeight = (int) jb.get("clipHeight");//�ü��ĸ߶�
					int x = (int) jb.get("x");//�ü�����ߵ�X����
					int y = (int) jb.get("y");//�ü�����ߵ�Y����
					int rotateAngle=(int)jb.get("rotateAngle");//ѡ��Ƕȣ���ֵΪ0��90��180��270
					String RotateImgPath=rootPath+ImgCompressUtil.getFilePathNoFileName(sourceImgSrc)+"rotate_"+ImgCompressUtil.getFileNameHasEx(sourceImgSrc);
					boolean isrotateOk=true;
					//�Ƿ�����תͼƬ
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
					
					
					//���Ҫ�ü���100�ģ���Ҫ�������������,x/y�������°���������
					double rateW=((double)clipWidth)/100;
					double rateH=((double)clipHeight)/100;
					zoomImgWidth=(int)(((double)zoomImgWidth)/rateW);
					zoomImgHeight=(int)(((double)zoomImgHeight)/rateH);
					x=(int)(((double)x)/rateW);
					y=(int)(((double)y)/rateH);
					clipWidth=100;
					clipHeight=100;
					
					
					//ֻ֧�����ź�洢Ϊjpg����
					String ZoomImgPath=rootPath+ImgCompressUtil.getFilePathNoFileName(sourceImgSrc)+"zoom_"+ImgCompressUtil.getFileNameNoEx(sourceImgSrc)+".jpg";
					
					//proportion���Ϊfalse����Ϊǰ̨�Ѿ����������Ŵ�С
					boolean isCompressOk = ImgCompressUtil.compressPic(rootPath+sourceImgSrc, 
							ZoomImgPath,zoomImgWidth, zoomImgHeight, false);
					
					if(isrotateOk&&isCompressOk)
					{
						if(savePath=="")
						{
							savePath=ImgCompressUtil.getFilePathNoFileName(sourceImgSrc);
						}
						String newImgPath=savePath+ImgCompressUtil.getRandomName()+ImgCompressUtil.getExtensionName(sourceImgSrc);
						//���ųɹ������вü�
						boolean isClipOk=ImgCompressUtil.cutPic(ZoomImgPath, rootPath+newImgPath, x, y, clipWidth, clipHeight);
						if(isClipOk)
						{
							//ɾ�����ŵĹ��ɵ�ͼƬ,ֻ����ԭͼ�Ͳü����ͼƬ
							File zoomFile=new File(ZoomImgPath);
							zoomFile.delete();
							File rotateFile=new File(RotateImgPath);
							rotateFile.delete();
							//�ü��ɹ�������·��
							response.setCharacterEncoding("UTF-8");
							//����·��
							response.getWriter().write("{status:'ok',msg:'"+newImgPath+"'}");
						}else
						{
							//�ü�ʧ�ܣ����ش�����Ϣ
							response.setCharacterEncoding("UTF-8");
							//����·��
							response.getWriter().write("{status:'error',msg:'ͼƬ�ü�ʧ��'}");
						}
					}else if(!isrotateOk)
					{
						//�ü��ɹ�������·��
						response.setCharacterEncoding("UTF-8");
						//����·��
						response.getWriter().write("{status:'error',msg:'��תͼƬʧ��'}");
					}
					else
					{
						//����ʧ�ܣ����ش�����Ϣ
						response.setCharacterEncoding("UTF-8");
						//����·��
						response.getWriter().write("{status:'error',msg:'ͼƬѹ��ʧ��'}");
					}
					
					
				} catch (JSONException e) {
					// TODO �Զ����ɵ� catch ��
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
