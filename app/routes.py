from flask import render_template, request, jsonify, flash, redirect, url_for
from app.upload_handler import handle_upload
from datetime import datetime
import os

def register_routes(app):
    """Register all routes for the Legal AI Analyzer application"""

    # Sample data for demonstration - shared across routes
    sample_reports = [
            {
                'id': 'report_1',
                'title': 'Hợp đồng thuê nhà chung cư Vinhomes Central Park - Phân tích chi tiết các điều khoản rủi ro cao',
                'date': '15/12/2024',
                'size': '2.3 MB',
                'risk_score': 75,
                'risk_level': 'high',
                'summary': 'Phát hiện 3 điều khoản bất lợi chính: phí phạt cao (5%/ngày cho việc chậm trả tiền thuê), quyền đơn phương chấm dứt hợp đồng của bên cho thuê mà không cần lý do chính đáng, và trách nhiệm bảo trì không rõ ràng dẫn đến khả năng người thuê phải chịu toàn bộ chi phí sửa chữa. Đặc biệt, điều khoản về tiền cọc không được hoàn trả trong nhiều trường hợp mơ hồ có thể gây thiệt hại lớn cho người thuê.',
                'status': 'completed'
            },
            {
                'id': 'report_2',
                'title': 'Hợp đồng lao động công ty ABC Technology Solutions',
                'date': '14/12/2024',
                'size': '1.8 MB',
                'risk_score': 45,
                'risk_level': 'medium',
                'summary': 'Hợp đồng tương đối cân bằng với 1 điều khoản cần lưu ý về thời gian thử việc kéo dài 6 tháng (cao hơn quy định pháp luật) và quy định về làm thêm giờ không rõ ràng về mức lương overtime. Các điều khoản khác như bảo hiểm, phúc lợi được quy định đầy đủ và phù hợp với luật lao động hiện hành.',
                'status': 'completed'
            },
            {
                'id': 'report_3',
                'title': 'Hợp đồng mua bán xe ô tô Honda Civic 2024',
                'date': '13/12/2024',
                'size': '950 KB',
                'risk_score': 25,
                'risk_level': 'low',
                'summary': 'Hợp đồng được soạn thảo tốt với các điều khoản rõ ràng và cân bằng quyền lợi giữa hai bên. Bảo hành được quy định chi tiết, thủ tục chuyển nhượng đầy đủ theo quy định pháp luật.',
                'status': 'completed'
            },
            {
                'id': 'report_4',
                'title': 'Hợp đồng đầu tư bất động sản dự án Green Valley Resort & Spa - Giai đoạn 2',
                'date': '12/12/2024',
                'size': '4.1 MB',
                'risk_score': 85,
                'risk_level': 'high',
                'summary': 'Hợp đồng chứa nhiều rủi ro nghiêm trọng: không có cam kết cụ thể về tiến độ bàn giao, điều khoản phạt chậm tiến độ quá thấp (chỉ 0.01%/ngày), quyền đơn phương thay đổi thiết kế và vật liệu xây dựng mà không cần thông báo trước. Đặc biệt nguy hiểm là điều khoản cho phép chủ đầu tư hủy hợp đồng và chỉ hoàn trả 70% số tiền đã đóng trong trường hợp "bất khả kháng" được định nghĩa rất mơ hồ. Khuyến nghị mạnh mẽ không ký kết hợp đồng này.',
                'status': 'completed'
            },
            {
                'id': 'report_5',
                'title': 'Hợp đồng dịch vụ tư vấn pháp lý',
                'date': '11/12/2024',
                'size': '1.2 MB',
                'risk_score': 35,
                'risk_level': 'medium',
                'summary': 'Hợp đồng có một số điểm cần cải thiện về phạm vi dịch vụ và trách nhiệm bồi thường.',
                'status': 'completed'
            },
            {
                'id': 'report_6',
                'title': 'Hợp đồng thuê mặt bằng kinh doanh tại trung tâm thương mại Landmark 81',
                'date': '10/12/2024',
                'size': '3.5 MB',
                'risk_score': 60,
                'risk_level': 'medium',
                'summary': 'Hợp đồng thuê mặt bằng có một số điều khoản bất lợi: phí quản lý tăng 10% mỗi năm mà không có giới hạn tối đa, quy định về giờ hoạt động khá hạn chế (chỉ đến 22h), và điều khoản cấm chuyển nhượng hoàn toàn ngay cả khi có sự đồng ý của chủ sở hữu. Tuy nhiên, vị trí kinh doanh thuận lợi và các điều khoản về bảo trì, an ninh được quy định rõ ràng.',
                'status': 'completed'
            }
    ]

    # Sample statistics
    stats = {
        'total_reports': 28,
        'high_risk': 12,
        'avg_processing_time': 3.2,
        'accuracy': 89
    }

    @app.route('/')
    def index():
        """Homepage with document upload interface"""
        return render_template('index.html')

    @app.route('/dashboard')
    def dashboard():
        """Dashboard showing list of analyzed reports"""
        # Chỉ hiển thị 3 báo cáo mới nhất cho dashboard
        recent_reports = sample_reports[-3:]  # Lấy 3 báo cáo cuối cùng

        return render_template('dashboard.html', reports=recent_reports, stats=stats)

    @app.route('/reports')
    def all_reports():
        """Trang hiển thị tất cả báo cáo với đầy đủ tính năng lọc"""
        # Trả về tất cả báo cáo cho trang này
        return render_template('all_reports.html', reports=sample_reports, stats=stats)

    @app.route('/report/<report_id>')
    def report(report_id):
        """Individual report view with chat interface"""
        # Sample report data for demonstration
        sample_report = {
            'id': report_id,
            'title': 'Hợp đồng thuê nhà chung cư Vinhomes',
            'date': '15/12/2024',
            'risk_score': 75,
            'risk_level': 'high',
            'risk_description': 'Hợp đồng này chứa nhiều điều khoản bất lợi có thể gây rủi ro cao cho bạn. Khuyến nghị xem xét kỹ trước khi ký kết.',
            'findings': [
                {
                    'title': 'Phí phạt chậm trả tiền thuê quá cao',
                    'description': 'Hợp đồng quy định phí phạt 5%/ngày cho việc chậm trả tiền thuê, mức này cao hơn nhiều so với quy định pháp luật (tối đa 150% lãi suất cơ bản).',
                    'recommendation': 'Đề nghị giảm mức phí phạt xuống 0.05%/ngày hoặc theo quy định pháp luật hiện hành.',
                    'severity': 'high'
                },
                {
                    'title': 'Quyền đơn phương chấm dứt hợp đồng',
                    'description': 'Chủ nhà có quyền đơn phương chấm dứt hợp đồng mà không cần lý do chính đáng, chỉ cần thông báo trước 15 ngày.',
                    'recommendation': 'Yêu cầu bổ sung điều khoản về lý do chấm dứt hợp đồng và thời gian thông báo tối thiểu 30 ngày.',
                    'severity': 'high'
                },
                {
                    'title': 'Trách nhiệm bảo trì không rõ ràng',
                    'description': 'Hợp đồng không phân định rõ trách nhiệm bảo trì, sửa chữa giữa chủ nhà và người thuê, có thể dẫn đến tranh chấp sau này.',
                    'recommendation': 'Bổ sung điều khoản chi tiết về trách nhiệm bảo trì của từng bên và phân chia chi phí cụ thể.',
                    'severity': 'medium'
                }
            ],
            'stats': {
                'high_risk': 3,
                'medium_risk': 2,
                'low_risk': 1
            }
        }

        return render_template('report.html', report=sample_report)

    # API Routes for AJAX calls
    @app.route('/upload/document', methods=['POST'])
    def upload_document():
        """Handle document upload"""
        if 'document' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['document']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # For now, just return a mock response
        # In real implementation, this would save the file and return document ID
        document_id = f"doc_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        #save file on server
        print(file.read())

        return jsonify({
            'success': True,
            'document_id': document_id,
            'message': 'File uploaded successfully'
        })

    @app.route('/api/analysis', methods=['POST'])
    def analyze_document():
        """Analyze uploaded document"""
        data = request.get_json()
        document_id = data.get('document_id')

        if not document_id:
            return jsonify({'error': 'Document ID required'}), 400

        # Mock analysis response
        analysis_id = f"analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        return jsonify({
            'success': True,
            'analysis_id': analysis_id,
            'message': 'Analysis completed'
        })

    @app.route('/api/reports/<report_id>', methods=['GET'])
    def get_report(report_id):
        """Get report data"""
        # Mock report data
        return jsonify({
            'id': report_id,
            'title': 'Sample Report',
            'status': 'completed',
            'risk_score': 75
        })

    @app.route('/chat/send', methods=['POST'])
    def chat_send():
        """Handle chat messages"""
        data = request.get_json()
        message = data.get('message', '')
        report_id = data.get('report_id', '')

        if not message:
            return jsonify({'error': 'Message required'}), 400

        # Mock AI response based on message content
        response_message = get_mock_ai_response(message)

        return jsonify({
            'success': True,
            'message': response_message,
            'timestamp': datetime.now().isoformat()
        })

def get_mock_ai_response(message):
    """Generate mock AI responses for chat"""
    message_lower = message.lower()

    responses = {
        'rủi ro pháp lý': 'Dựa trên phân tích hợp đồng, tôi đã xác định được 3 rủi ro pháp lý chính: (1) **Rủi ro cao**: Mức phí phạt 5%/ngày vượt quá quy định pháp luật, có thể bị tòa án tuyên bố vô hiệu. (2) **Rủi ro trung bình**: Điều khoản chấm dứt đơn phương thiếu căn cứ pháp lý rõ ràng. (3) **Rủi ro thấp**: Phân chia trách nhiệm bảo trì chưa chi tiết. Khuyến nghị ưu tiên đàm phán lại điều khoản phí phạt trước.',
        'tuân thủ pháp luật': 'Hợp đồng này có một số điểm chưa tuân thủ đầy đủ quy định pháp luật: **Vi phạm Nghị định 15/2015/NĐ-CP** về mức phí phạt tối đa. **Chưa tuân thủ Luật Nhà ở 2014** về thời hạn thông báo chấm dứt hợp đồng. **Thiếu quy định** về giải quyết tranh chấp theo Luật Trọng tài thương mại. Tỷ lệ tuân thủ tổng thể: **72%**. Cần bổ sung và điều chỉnh để đảm bảo tính pháp lý.',
        'điều khoản bất lợi': 'Tôi đã xác định 4 điều khoản bất cân xứng gây bất lợi: **(1) Phí phạt quá cao** - 5%/ngày so với mức tối đa 0.05%/ngày theo quy định. **(2) Quyền chấm dứt đơn phương** - Chỉ có lợi cho một bên. **(3) Trách nhiệm bảo trì** - Đẩy toàn bộ chi phí cho người thuê. **(4) Điều kiện hoàn cọc** - Quá khắt khe và mơ hồ. **Đề xuất**: Đàm phán giảm phí phạt xuống 0.05%/ngày, bổ sung điều kiện chấm dứt hợp đồng hợp lý.',
        'chấm dứt': 'Phân tích điều khoản chấm dứt hợp đồng: **Thời hạn thông báo**: 15 ngày (không đủ theo Luật Nhà ở - tối thiểu 30 ngày). **Lý do chấm dứt**: Quá rộng, thiếu tính cụ thể. **Hậu quả vi phạm**: Mất toàn bộ tiền cọc + phí phạt cao. **Rủi ro pháp lý**: Cao - có thể bị tòa án tuyên bố một phần điều khoản vô hiệu. **Khuyến nghị**: Yêu cầu thời hạn thông báo 30 ngày, quy định rõ lý do chấm dứt hợp lý, giới hạn mức phạt theo quy định pháp luật.',
        'đề xuất cải thiện': '**Đề xuất 5 điều chỉnh ưu tiên để cải thiện hợp đồng**: **(1) Giảm phí phạt** từ 5%/ngày xuống 0.05%/ngày theo Nghị định 15/2015. **(2) Tăng thời hạn thông báo** chấm dứt từ 15 lên 30 ngày. **(3) Bổ sung điều khoản** phân chia rõ trách nhiệm bảo trì. **(4) Quy định cụ thể** điều kiện hoàn trả tiền cọc. **(5) Thêm cơ chế** giải quyết tranh chấp qua hòa giải trước khi ra tòa. Những điều chỉnh này sẽ giảm rủi ro pháp lý từ 75% xuống còn 25%.'
    }

    for keyword, response in responses.items():
        if keyword in message_lower:
            return response

    return 'Tôi hiểu câu hỏi của bạn về hợp đồng này. Dựa trên phân tích chi tiết, tôi có thể cung cấp đánh giá chuyên sâu về các khía cạnh pháp lý, rủi ro và đề xuất cải thiện. Bạn có thể sử dụng các câu hỏi gợi ý hoặc hỏi về bất kỳ điều khoản cụ thể nào trong hợp đồng để được tư vấn chi tiết hơn.'